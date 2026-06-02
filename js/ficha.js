// ======================================
// SESSÃO
// ======================================

const session = JSON.parse(localStorage.getItem("arkham_session"));

if (!session) window.location.href = "index.html";

// ======================================
// CONSTANTES
// ======================================

const ATTRIBUTES = ["FOR","CON","TAM","DES","APA","EDU","INT","POD","SOR"];

const SKILLS = [
"Armas de Fogo","Armas Brancas","Furtividade","Esquivar","Intimidação",
"Persuasão","Charme","Investigação","Ocultismo","História","Medicina",
"Primeiros Socorros","Dirigir","Natação","Escalar","Arremessar",
"Sobrevivência","Psicologia","Antropologia","Contabilidade","Direito",
"Ciência","Eletrônica","Engenharia","Língua Nativa"
];

// ======================================
// HELPERS
// ======================================

const $ = id => document.getElementById(id);

const getHalf = v => Math.floor(v/2);
const getFifth = v => Math.floor(v/5);

// ======================================
// STATE
// ======================================

const fichaId = localStorage.getItem("fichaAtual");
let currentUser = null;
let currentSheet = null;

// ======================================
// USERS
// ======================================

function getUsers(){
return JSON.parse(localStorage.getItem("arkham_users")) || [];
}

function saveUsers(u){
localStorage.setItem("arkham_users", JSON.stringify(u));
}

function getUser(){
return getUsers().find(u => u.username === session.username);
}

// ======================================
// LOAD SHEET
// ======================================

function loadSheet(){
currentUser = getUser();
currentSheet = currentUser.fichas.find(f => f.id === fichaId);
}

// ======================================
// TABS
// ======================================

document.querySelectorAll(".tab-button").forEach(btn=>{
btn.onclick=()=>{
document.querySelectorAll(".tab-button").forEach(b=>b.classList.remove("active"));
document.querySelectorAll(".tab-content").forEach(t=>t.classList.remove("active"));
btn.classList.add("active");
$(btn.dataset.tab).classList.add("active");
}
});

// ======================================
// ATTRIBUTES
// ======================================

function createAttributes(){

const c = $("atributosContainer");
c.innerHTML="";

ATTRIBUTES.forEach(a=>{
const div=document.createElement("div");
div.innerHTML=`
<label>${a}</label>
<input id="${a}" type="number" value="0">
<input id="${a}_half" readonly>
<input id="${a}_fifth" readonly>
`;
c.appendChild(div);

$(a).oninput=()=>{
updateAttr(a);
recalc();
updateSkills();
}
});
}

function updateAttr(a){
const v=Number($(a).value)||0;
$(a+"_half").value=getHalf(v);
$(a+"_fifth").value=getFifth(v);
}

// ======================================
// SKILLS
// ======================================

function createSkills(){
const c=$("skillsContainer");
c.innerHTML="";

SKILLS.forEach(s=>{
const div=document.createElement("div");
div.innerHTML=`
<label>${s}</label>
<input id="sk_${s}" type="number" value="0">
<input id="sk_${s}_half" readonly>
<input id="sk_${s}_fifth" readonly>
`;
c.appendChild(div);

$("sk_"+s).oninput=()=>updateSkill(s);
});
}

function skillValue(s){
if(s==="Esquivar") return getHalf(Number($("DES").value)||0);
if(s==="Língua Nativa") return Number($("EDU").value)||0;
return Number($("sk_"+s).value)||0;
}

function updateSkill(s){
const v=skillValue(s);
$("sk_"+s+"_half").value=getHalf(v);
$("sk_"+s+"_fifth").value=getFifth(v);
}

function updateSkills(){
SKILLS.forEach(updateSkill);
}

// ======================================
// DERIVADOS
// ======================================

function recalc(){

const CON=Number($("CON").value)||0;
const TAM=Number($("TAM").value)||0;
const DES=Number($("DES").value)||0;
const FOR=Number($("FOR").value)||0;
const POD=Number($("POD").value)||0;

const PV=Math.floor((CON+TAM)/2);
const PM=POD;
const SAN=POD*5;

let MOV=7;
if(DES>FOR&&DES>TAM) MOV=8;
if(FOR>DES&&TAM>DES) MOV=6;

set("PV",PV);
set("PM",PM);
set("SAN",SAN);
set("MOV",MOV);

currentSheet.state={PV,PM,SAN,MOV};
}

function set(id,v){
const el=$(id);
if(el) el.value=v;
}

// ======================================
// INVENTÁRIO / ARMAS / MAGIAS / RELAÇÕES
// ======================================

function addItem(type,data){
if(!currentSheet[type]) currentSheet[type]=[];
currentSheet[type].push(data);
renderAll();
}

function removeItem(type,index){
currentSheet[type].splice(index,1);
renderAll();
}

// ======================================
// IMAGE UPLOAD
// ======================================

let imageBase64=null;

$("imageUpload")?.addEventListener("change",e=>{
const file=e.target.files[0];
const reader=new FileReader();
reader.onload=()=>{
imageBase64=reader.result;
currentSheet.image=imageBase64;
};
reader.readAsDataURL(file);
});

// ======================================
// SAVE / LOAD
// ======================================

function save(){

const users=getUsers();
const u=users.find(x=>x.username===session.username);

const i=u.fichas.findIndex(f=>f.id===fichaId);
u.fichas[i]=currentSheet;

saveUsers(users);
alert("Ficha salva!");
}

function exportJSON(){
const blob=new Blob([JSON.stringify(currentSheet)],{type:"application/json"});
const a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="ficha.json";
a.click();
}

function importJSON(file){
const reader=new FileReader();
reader.onload=()=>{
currentSheet=JSON.parse(reader.result);
renderAll();
};
reader.readAsText(file);
}

// ======================================
// INIT
// ======================================

function init(){
loadSheet();
createAttributes();
createSkills();
recalc();
updateSkills();
}

init();
