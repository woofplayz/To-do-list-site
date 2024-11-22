const newTaskInput = document.getElementById("new-task");
const toDoList = document.querySelector(".to-do-list");
const doneList = document.querySelector(".done-list");
const reorderButton = document.getElementById("reorder-toggle");
const deleteButton = document.getElementById("delete-toggle");

let isReorderModeActive = false;
let isDeleteModeActive = false;

document.addEventListener("DOMContentLoaded", loadTasks);

reorderButton.addEventListener("click", toggleReorderMode);
deleteButton.addEventListener("click", toggleDeleteMode);

function saveTasks() {
  const tasks = {
    toDo: [],
    done: []
  };

  document.querySelectorAll(".to-do-list .list-items").forEach(task => {
    tasks.toDo.push(task.textContent.trim());
  });
  document.querySelectorAll(".done-list .list-items").forEach(task => {
    tasks.done.push(task.textContent.trim());
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks"));
  if (tasks) {
    tasks.toDo.forEach(task => addTask(task, "to-do"));
    tasks.done.forEach(task => addTask(task, "done"));
  }
}

function addTask(text, status = "to-do") {
  const taskDiv = document.createElement("div");
  taskDiv.classList.add("list-items");
  
  const checkBoxDiv = document.createElement("div");
  checkBoxDiv.classList.add("check-box");
  taskDiv.appendChild(checkBoxDiv);
  
  const span = document.createElement("span");
  span.textContent = text;
  taskDiv.appendChild(span);
  
  if (status === "done") {
    checkBoxDiv.classList.add("done");
  }

  if (status === "to-do") {
    toDoList.appendChild(taskDiv);
  } else {
    doneList.appendChild(taskDiv);
  }

  taskDiv.addEventListener("click", () => {
    if (!isReorderModeActive && !isDeleteModeActive) {
      toggleTaskStatus(taskDiv);
    }
  });

  if (isDeleteModeActive) {
    addDeleteButton(taskDiv);
  }

  if (isReorderModeActive) {
    taskDiv.setAttribute("draggable", true);
    taskDiv.addEventListener("dragstart", handleDragStart);
    taskDiv.addEventListener("dragover", handleDragOver);
    taskDiv.addEventListener("drop", handleDrop);
    taskDiv.addEventListener("dragend", handleDragEnd);  // Added for cleanup
  }
}

function toggleTaskStatus(taskDiv) {
  const checkBox = taskDiv.querySelector(".check-box");
  const isDone = checkBox.classList.contains("done");

  if (isDone) {
    doneList.removeChild(taskDiv);
    toDoList.appendChild(taskDiv);
    checkBox.classList.remove("done");
  } else {
    toDoList.removeChild(taskDiv);
    doneList.appendChild(taskDiv);
    checkBox.classList.add("done");
  }

  saveTasks();
}

function toggleReorderMode() {
  isReorderModeActive = !isReorderModeActive;

  if (isReorderModeActive) {
    isDeleteModeActive = false;
    deleteButton.textContent = "Toggle Delete";
    reorderButton.textContent = "Reorder Mode On";
    activateReorderMode();
  } else {
    reorderButton.textContent = "Toggle Reorder";
    deactivateReorderMode();
  }
}

function toggleDeleteMode() {
  isDeleteModeActive = !isDeleteModeActive;

  if (isDeleteModeActive) {
    isReorderModeActive = false;
    reorderButton.textContent = "Toggle Reorder";
    deleteButton.textContent = "Delete Mode On";
    activateDeleteMode();
  } else {
    deleteButton.textContent = "Toggle Delete";
    deactivateDeleteMode();
  }
}

function activateReorderMode() {
  document.querySelectorAll(".list-items").forEach(taskDiv => {
    taskDiv.setAttribute("draggable", true);
    taskDiv.addEventListener("dragstart", handleDragStart);
    taskDiv.addEventListener("dragover", handleDragOver);
    taskDiv.addEventListener("drop", handleDrop);
    taskDiv.addEventListener("dragend", handleDragEnd); 
  });
}

function deactivateReorderMode() {
  document.querySelectorAll(".list-items").forEach(taskDiv => {
    taskDiv.removeAttribute("draggable");
    taskDiv.removeEventListener("dragstart", handleDragStart);
    taskDiv.removeEventListener("dragover", handleDragOver);
    taskDiv.removeEventListener("drop", handleDrop);
    taskDiv.removeEventListener("dragend", handleDragEnd);
  });
}

function activateDeleteMode() {
  document.querySelectorAll(".list-items").forEach(taskDiv => {
    addDeleteButton(taskDiv);
  });
}

function deactivateDeleteMode() {
  document.querySelectorAll(".delete-button").forEach(button => button.remove());
}

function addDeleteButton(taskDiv) {
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("delete-button");
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation(); 
    taskDiv.remove();
    saveTasks();
  });
  taskDiv.appendChild(deleteBtn);
}

let draggedItem = null;

function handleDragStart(e) {
  draggedItem = this;
  this.classList.add("dragging"); 
}

function handleDragOver(e) {
  e.preventDefault();

  const target = e.target;
  if (target && target !== draggedItem && target.classList.contains("list-items")) {
    target.classList.add("highlight");
  }
}

function handleDrop(e) {
  e.preventDefault();

  const target = e.target;
  if (target && target !== draggedItem && target.classList.contains("list-items")) {
    target.classList.remove("highlight");
    const targetList = target.parentNode;
    const sourceList = draggedItem.parentNode;

    if (targetList === sourceList) {
      if (target !== draggedItem) {
        targetList.insertBefore(draggedItem, target.nextSibling === draggedItem ? target : target.nextSibling);
        saveTasks();
      }
    }
  }
}

function handleDragEnd(e) {
  draggedItem.classList.remove("dragging");  
  document.querySelectorAll(".list-items").forEach(item => {
    item.classList.remove("highlight"); 
  });
}

newTaskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && newTaskInput.value.trim() !== "") {
    const taskText = newTaskInput.value.trim();
    addTask(taskText, "to-do");
    newTaskInput.value = ""; 
    saveTasks(); 
  }
});
