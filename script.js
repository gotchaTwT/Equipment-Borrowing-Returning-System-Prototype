let transactionCounter=1001;
let transactions=[];

const students={
"2024-08-01079":{name:"Johnree Mathew A. GO",course:"BSIT",year:"2nd Year"},
"2024-06-00060":{name:"Jashzel Yap",course:"BSIT",year:"2nd Year"},
"2024-07-00533":{name:"John Patrick Samson",course:"BSIT",year:"2nd Year"},
"2024-07-00321":{name:"Mark Joseph C. Tugade",course:"BSIT",year:"2nd Year"},
"2024-08-02001":{name:"Alice Santos",course:"BSMM",year:"3rd Year"},
"2024-08-03002":{name:"Bob Cruz",course:"BSEd",year:"4th Year"},
"2024-08-04003":{name:"Charlie Reyes",course:"BSA",year:"2nd Year"},
"2024-08-05004":{name:"Dana Lopez",course:"BSHM",year:"1st Year"}
};

const subjectsByCourse={
BSIT:["Programming","OOP","Data Structures","DB Management","Web Dev","Computer Networks"],
BSMM:["Marketing","Consumer Behavior","Sales Management","Advertising","Digital Marketing"],
BSEd:["Foundations of Education","Curriculum Development","Educational Psychology","Assessment of Learning","Teaching Strategies"],
BSA:["Financial Accounting","Cost Accounting","Auditing","Taxation","Business Law"],
BSHM:["Hospitality Management","Food & Beverage Service","Front Office Operations","Housekeeping","Tourism Management"]
};

let equipment=[
{id:"FAN-01", code:"EQ-001", name:"Electric Fan", status:"Available"},
{id:"BALL-01", code:"EQ-002", name:"Ball", status:"Available"},
{id:"SPEAKER-01", code:"EQ-003", name:"Speaker", status:"Available"},
{id:"MONITOR-01", code:"EQ-004", name:"Monitor", status:"Available"}
];

// DOM Elements
const studentId=document.getElementById("studentId");
const sName=document.getElementById("sName");
const sCourse=document.getElementById("sCourse");
const sYear=document.getElementById("sYear");
const borrowTime=document.getElementById("borrowTime");
const equipSelect=document.getElementById("equipSelect");
const purpose=document.getElementById("purpose");
const customPurpose=document.getElementById("customPurpose");
const subjectSelect=document.getElementById("subject");
const mainAreaSelect=document.getElementById("mainArea");
const specificRoomSelect=document.getElementById("specificRoom");
const duration=document.getElementById("duration");
const borrowBtn=document.getElementById("borrowBtn");
const returnSelect=document.getElementById("returnSelect");
const returnStudentIdInput=document.getElementById("returnStudentId");
const condition=document.getElementById("condition");
const returnBtn=document.getElementById("returnBtn");
const transactionTable=document.getElementById("transactionTable");

// Admin elements
const adminPanel=document.getElementById("adminPanel");
const allEquipList=document.getElementById("allEquipList");
const addEquipBtn=document.getElementById("addEquipBtn");
const newEquipName=document.getElementById("newEquipName");
const newEquipCode=document.getElementById("newEquipCode");
const adminTransactionTable=document.getElementById("adminTransactionTable");
const searchTransaction=document.getElementById("searchTransaction");

// Rooms
const specificRooms=["2A"];
["A","B","C","D","E","F","G","H","I"].forEach(l=>specificRooms.push("3"+l));
["A","B","C","D","E","F","G","H","I"].forEach(l=>specificRooms.push("4"+l));
["A","B","C","D","E","F","G"].forEach(l=>specificRooms.push("5"+l));
specificRooms.forEach(r=>specificRoomSelect.innerHTML+=`<option value="${r}">${r}</option>`);

// Prevent selecting both
mainAreaSelect.addEventListener("change", ()=>{specificRoomSelect.disabled=mainAreaSelect.value?true:false; toggleBorrowButton();});
specificRoomSelect.addEventListener("change", ()=>{mainAreaSelect.disabled=specificRoomSelect.value?true:false; toggleBorrowButton();});

// Load LocalStorage
if(localStorage.getItem("transactions")) transactions=JSON.parse(localStorage.getItem("transactions"));
if(localStorage.getItem("equipment")) equipment=JSON.parse(localStorage.getItem("equipment"));

// Duration options
const durations=[30,60,120,180,240,480,720,1440];
duration.innerHTML=durations.map(d=>`<option value="${d}">${d>=60?d/60+" hour(s)":d+" minutes"}</option>`).join("");

// Student ID auto-format
studentId.addEventListener("input", formatStudentId);
returnStudentIdInput.addEventListener("input", formatReturnStudentId);
function formatStudentId(){let val=studentId.value.replace(/[^0-9]/g,''); let f=val.slice(0,4); if(val.length>4) f+='-'+val.slice(4,6); if(val.length>6) f+='-'+val.slice(6,11); studentId.value=f; checkStudent(); updateSubjects(); toggleBorrowButton(); checkAdmin();}
function formatReturnStudentId(){let val=returnStudentIdInput.value.replace(/[^0-9]/g,''); let f=val.slice(0,4); if(val.length>4) f+='-'+val.slice(4,6); if(val.length>6) f+='-'+val.slice(6,11); returnStudentIdInput.value=f;}

// STUDENT CHECK
function checkStudent(){ const id=studentId.value.trim(); if(students[id]){ const s=students[id]; sName.innerText=s.name; sCourse.innerText=s.course; sYear.innerText=s.year; borrowTime.innerText=new Date().toLocaleString(); } else { sName.innerText="-"; sCourse.innerText="-"; sYear.innerText="-"; borrowTime.innerText="-"; }}

// SUBJECTS PER COURSE
function updateSubjects(){ const course=students[studentId.value.trim()]?.course; if(course && subjectsByCourse[course]){ subjectSelect.innerHTML='<option value="">--Select Subject--</option>'; subjectsByCourse[course].forEach(s=>subjectSelect.innerHTML+=`<option value="${s}">${s}</option>`); subjectSelect.disabled=false;} else{subjectSelect.innerHTML='<option value="">--Select Subject--</option>'; subjectSelect.disabled=true;} toggleBorrowButton();}

// PURPOSE OTHER
purpose.addEventListener("change", ()=>{customPurpose.style.display=purpose.value==="Others"?"block":"none"; if(purpose.value!=="Others") customPurpose.value=""; toggleBorrowButton();});
customPurpose.addEventListener("input", toggleBorrowButton);

// TOGGLE BORROW BUTTON
function toggleBorrowButton(){ let p=purpose.value==="Others"?customPurpose.value.trim():purpose.value; const ready=studentId.value.trim() && p && subjectSelect.value && getSelectedLabRoom() && equipSelect.value && students[studentId.value.trim()]; borrowBtn.disabled=!ready;}

// REFRESH EQUIPMENT UI
function refreshEquipmentUI(){ equipSelect.innerHTML=""; returnSelect.innerHTML=""; equipment.forEach(item=>{ if(item.status==="Available") equipSelect.innerHTML+=`<option value="${item.id}">${item.name} (${item.code})</option>`; if(item.status==="Borrowed") returnSelect.innerHTML+=`<option value="${item.id}">${item.name} (${item.code})</option>`; });}

// LAB/ROOM
function getSelectedLabRoom(){return mainAreaSelect.value || specificRoomSelect.value || "";}

// BORROW EQUIPMENT
borrowBtn.addEventListener("click", ()=>{
  const id=studentId.value.trim(); const s=students[id]; const equipId=equipSelect.value;
  let p=purpose.value==="Others"?customPurpose.value.trim():purpose.value;
  const subj=subjectSelect.value; const lab=getSelectedLabRoom(); const dur=parseInt(duration.value);
  if(!equipId || !p || !subj || !lab){alert("Please complete all required fields");return;}
  const item=equipment.find(e=>e.id===equipId); item.status="Borrowed";
  const now=new Date(); const deadline=new Date(now.getTime()+dur*60000);
  transactions.push({ tx:transactionCounter++, studentID:id, student:s.name, course:s.course, year:s.year, item:item.name, code:item.code, purpose:p, subject:subj, lab:lab, borrowTime:now.toLocaleString(), duration:dur, returnTime:"-", status:"Borrowed", condition:"-", penalty:0, deadline:deadline });
  saveData(); refreshTables();
  alert(`Success! ${item.name} (${item.code}) borrowed by ${s.name}`);
});

// RETURN EQUIPMENT
returnBtn.addEventListener("click", ()=>{
  const equipId=returnSelect.value; const cond=condition.value; const id=returnStudentIdInput.value.trim();
  if(!id){alert("Student ID required"); return;}
  const item=equipment.find(e=>e.id===equipId);
  const tx=[...transactions].reverse().find(t=>t.item===item.name && t.returnTime==="-" && t.studentID===id);
  if(!tx){alert("Transaction not found!"); return;}
  const now=new Date(); item.status=cond==="OK"?"Available":"Damaged";
  let penalty=0; if(now>tx.deadline) penalty+=50; if(cond!=="OK") penalty+=100;
  tx.returnTime=now.toLocaleString(); tx.condition=cond; tx.penalty=penalty; tx.status="Returned";
  saveData(); refreshTables(); alert(`Successfully returned ${item.name} (${item.code}) by Student ID: ${id}`);
});

// REFRESH TRANSACTION TABLE
function refreshTables(){ transactionTable.innerHTML=""; transactions.forEach(t=>{ transactionTable.innerHTML+=`<tr>
<td>${t.studentID}</td><td>${t.student}</td><td>${t.course}</td><td>${t.year}</td>
<td>${t.item}</td><td>${t.code}</td><td>${t.purpose}</td><td>${t.subject}</td>
<td>${t.lab}</td><td>${t.borrowTime}</td><td>${t.duration}</td>
<td>${t.returnTime}</td><td class="status-${t.status.toLowerCase()}">${t.status}</td><td>${t.condition}</td><td class="penalty">${t.penalty}</td>
</tr>`}); refreshEquipmentUI(); toggleBorrowButton(); refreshAdminTransactions();}

// SAVE DATA
function saveData(){ localStorage.setItem("transactions", JSON.stringify(transactions)); localStorage.setItem("equipment", JSON.stringify(equipment));}

// ADMIN PANEL
function checkAdmin() {
  const code = studentId.value.trim();
  if(code === "3636-36-36363") {
    adminPanel.style.display = "block";  // Show admin panel
  } else {
    adminPanel.style.display = "none";   // Hide admin panel
  }
}

// Admin Equip List
function refreshAdminEquipList(){ allEquipList.innerHTML=""; equipment.forEach((e,idx)=>{ allEquipList.innerHTML+=`<li>${e.name} (${e.code}) - Status: ${e.status} 
<button onclick="editEquip(${idx})">Edit</button> <button onclick="deleteEquip(${idx})">Delete</button></li>`;});}

// Add/Edit/Delete
addEquipBtn.addEventListener("click", ()=>{
  const name=newEquipName.value.trim(); const code=newEquipCode.value.trim();
  if(!name||!code){alert("Enter name and code"); return;}
  const id=name.toUpperCase().replace(/\s+/g,"-")+"-"+(Math.floor(Math.random()*100));
  equipment.push({id, code, name, status:"Available"}); saveData(); refreshEquipmentUI(); refreshAdminEquipList(); newEquipName.value=""; newEquipCode.value=""; alert(`${name} (${code}) added successfully!`);
});
window.editEquip=function(idx){ const e=equipment[idx]; const n=prompt("Name:",e.name); if(!n) return; const c=prompt("Code:",e.code); if(!c) return; e.name=n; e.code=c; saveData(); refreshEquipmentUI(); refreshAdminEquipList(); refreshAdminTransactions();}
window.deleteEquip=function(idx){ const e=equipment[idx]; if(confirm(`Delete ${e.name} (${e.code})?`)){ equipment.splice(idx,1); saveData(); refreshEquipmentUI(); refreshAdminEquipList(); refreshAdminTransactions(); }}

// Admin Transactions
function refreshAdminTransactions(filter=""){ adminTransactionTable.innerHTML=""; transactions.filter(t=>t.studentID.includes(filter)||t.student.toLowerCase().includes(filter.toLowerCase())||t.item.toLowerCase().includes(filter.toLowerCase()))
.forEach((t,idx)=>{ adminTransactionTable.innerHTML+=`<tr>
<td>${t.studentID}</td><td>${t.student}</td><td>${t.item}</td><td>${t.status}</td>
<td>${t.status==="Borrowed"?`<button onclick="forceReturn(${idx})">Force Return</button>`:""}</td>
</tr>`;});}

// Force Return
window.forceReturn=function(idx){ const t=transactions[idx]; const item=equipment.find(e=>e.name===t.item); item.status="Available"; t.status="Returned"; t.returnTime=new Date().toLocaleString(); t.condition="OK"; t.penalty=0; saveData(); refreshTables(); refreshAdminTransactions(); alert(`${t.item} force returned by Admin.`);}

// Search Transactions
searchTransaction.addEventListener("input", ()=>refreshAdminTransactions(searchTransaction.value));

// INITIAL LOAD
refreshTables();
