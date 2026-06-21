const wordInput = document.querySelector("#wordInput");
const searchBtn = document.querySelector("#searchBtn");
const loading = document.querySelector("#loading");

const saveWords = document.querySelector("#saveWords");
const wordList = document.querySelector("#wordList");

const resultBox = document.querySelector("#resultBox");
const wordTitle = document.querySelector("#wordTitle");
const saveBtn = document.querySelector("#saveBtn");

const wordMeaning = document.querySelector("#wordMeaning");
const wordExample = document.querySelector("#wordExample");
const wordSynonyms = document.querySelector("#wordSynonyms");
const wordAntonyms = document.querySelector("#wordAntonyms");

const quizBox = document.querySelector("#quizBox");
const quizQuestion = document.querySelector("#quizQuestion");
const quizAnswer = document.querySelector("#quizAnswer");
const checkQuizBtn = document.querySelector("#checkQuizBtn");
const quizResult = document.querySelector("#quizResult");

const API_KEY = config.OPENROUTER_API_KEY;
const URL = config.OPENROUTER_URL;

const getWordInfo = async (word) => {
  loading.classList.remove("hidden");
  resultBox.classList.remove("hidden");
  quizBox.classList.remove("hidden");

  const prompt = `
    Explain the English word "${word}" with:
    1. Meaning
    2. Example sentence
    3. 3 synonyms (array)
    4. 3 antonyms (array)
    5. A simple fill-in-the-blank quiz

    Return ONLY JSON:
  {
    "meaning":"",
    "example":"",
    "synonyms":[],
    "antonyms":[],
    "quiz": {
      "question": "",
      "answer": "",
    }
  }
    `
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "HTTP-Referer": "http://localhost",
        "X-Title": "Word Learning App",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.5,
      }),
    });

    if (!res.ok) throw new Error("API Error");
    const data = await res.json();
    let aiText = data.choices[0].message.content;

    let jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON Not Found");

    console.log(jsonMatch);
    

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.log(error);
    alert("Failed to Featch Word Details")
  } finally {
    loading.classList.add("hidden");
  }
};

wordInput.addEventListener("keydown",(e)=>{
  if(e.key === "Enter"){
    searchBtn.click();
  }
});

searchBtn.addEventListener("click", async ()=> {
  const word = wordInput.value.trim();
  if(!word) return alert("Please Enter a Word");

  const wordDetails = await getWordInfo(word);
  console.log(wordDetails);
  
  wordTitle.textContent = word.charAt(0).toUpperCase() + word.slice(1);
  wordMeaning.textContent = `Meaning: ${wordDetails.meaning}`;
  wordExample.textContent = `Example: ${wordDetails.example}`;
  wordSynonyms.textContent = `Synonyms: ${wordDetails.synonyms.join(", ")}`;
  wordAntonyms.textContent = `Antonyms: ${wordDetails.antonyms.join(", ")}`;

  quizQuestion.textContent = wordDetails.quiz.question;
  quizBox.dataset.answer = wordDetails.quiz.answer.toLowerCase();
});
// check button
checkQuizBtn.addEventListener("click", ()=>{
  const userAnswer = quizAnswer.value.trim().toLowerCase()
  const correctAnswer = quizBox.dataset.answer

  if(userAnswer === correctAnswer){
    quizResult.textContent = "✅ Correct Answer";
    quizResult.className = "text-green-800 font-semibold text-xl";
  }else{
    quizResult.textContent = `❌ Wrong Answer, Correct answer is ${correctAnswer}`
    quizResult.className = "text-red-800 font-semibold text-xl"
  }
});

let saved = JSON.parse(localStorage.getItem("wordBank")) || []

//save word
saveBtn.addEventListener("click", ()=>{
  const word = wordTitle.textContent
  if(!saved.includes(word)){
    saved.push(word)
    localStorage.setItem("wordBank", JSON.stringify(saved));
    displaySaveWords()
  } else{
    alert("Word Already Saved")
  }
});

// Display Saved Words
const displaySaveWords = ()=>{
  wordList.innerHTML = ""
  saved.forEach((word)=>{
    const li = document.createElement("li")
    li.innerHTML = `${word}
    <button onClick="deleteWord('${word}')" class=" text-red-500" >❌</button>`;
    wordList.appendChild(li);
  });
}

const deleteWord = (word)=>{
  saved = saved.filter((w)=> w !== word)
  localStorage.setItem("wordBank", JSON.stringify(saved));
  displaySaveWords()
};