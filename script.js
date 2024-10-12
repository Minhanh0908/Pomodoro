const circularProgressBar = document.querySelector("#circularProgressBar");
const circularProgressBarNumber = document.querySelector(
  "#circularProgressBar .progress-value"
);
const buttonTypePomodoro = document.querySelector("#buttonTypePomodoro");
const buttonTypeShortBreak = document.querySelector("#buttonTypeShortBreak");
const buttonTypeLongBreak = document.querySelector("#buttonTypeLongBreak");

const audio_reng = new Audio("Classic Alarm Clock.mp3");
const audio_tomato = new Audio("uwa.mp3");
const audio_click = new Audio("Click.mp3");
const audio_iwa = new Audio("iwa.mp3");

let pomodoroTimerInSeconds = 1500; //25minutes
let shortBreakTimerInSeconds = 300; //5ph
let longBreakTimerInSeconds = 900; //15ph
let pomodoroCount = 0; // Biến đếm số phiên Pomodoro đã hoàn thành

const TIMER_TYPE_POMODORO = "POMODORO";
const TIMER_TYPE_SHORT_BREAK = "SHORTBREAK";
const TIMER_TYPE_LONG_BREAK = "LONGBREAK";

let progressInterval = null;
let pomodoroType = TIMER_TYPE_POMODORO;
let timerValue = 1500;
let multiplierFactor = 360 / timerValue;
let isRunning = false;
let isPaused = false;

function formatNumberInStringMinute(number) {
  const minutes = Math.trunc(number / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.trunc(number % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes} : ${seconds}`;
}

const startTimer = () => {
  // Kiểm tra nếu đồng hồ đang chạy
  audio_reng.pause(); // Dừng âm thanh
  audio_reng.currentTime = 0; // Đặt lại âm thanh
  if (isRunning) return;

  console.log("Bắt đầu đồng hồ! Giá trị ban đầu:", timerValue);
  isRunning = true; // Đánh dấu đồng hồ đang chạy
  progressInterval = setInterval(() => {
    if (timerValue > 0) {
      timerValue--; // Giảm thời gian mỗi giây
      setInforCircularProgressBar(); // Cập nhật vòng tròn đếm ngược
    } else {
      stopTimer(); // Dừng đồng hồ khi hết thời gian
    }
  }, 1); // Đếm ngược mỗi giây
};

// Dừng đồng hồ khi hoàn thành
const stopTimer = () => {
  if (timerValue == 0) {
    audio_reng.play();
  }
  clearInterval(progressInterval); // Dừng tiến trình đếm ngược
  progressInterval = null; // Đảm bảo interval không gọi lại

  // Xử lý theo loại đồng hồ (Pomodoro, nghỉ ngắn, nghỉ dài)
  if (pomodoroType === TIMER_TYPE_POMODORO) {
    pomodoroCount++;
    updatePomodoroCountDisplay(); // Cập nhật đếm số phiên Pomodoro
    sendNotification("Pomodoro Complete", "Time for a break!");

    // Chuyển sang nghỉ dài sau mỗi 4 lần Pomodoro
    if (pomodoroCount % 4 === 0) {
      setPomodoroType(TIMER_TYPE_LONG_BREAK);
    } else {
      setPomodoroType(TIMER_TYPE_SHORT_BREAK);
    }
  } else {
    sendNotification("Break Complete", "Time to focus!");
    setPomodoroType(TIMER_TYPE_POMODORO); // Sau nghỉ, quay lại Pomodoro
  }
};

// Reset đồng hồ về giá trị ban đầu mà không gây đệ quy
const resetTimer = () => {
  clearInterval(progressInterval); // Dừng mọi interval hiện có
  progressInterval = null; // Đặt lại giá trị interval
  isRunning = false;
  isPaused = false;

  // Cập nhật thời gian theo loại đồng hồ hiện tại
  if (pomodoroType === TIMER_TYPE_POMODORO) {
    timerValue = pomodoroTimerInSeconds;
  } else if (pomodoroType === TIMER_TYPE_SHORT_BREAK) {
    timerValue = shortBreakTimerInSeconds;
  } else {
    timerValue = longBreakTimerInSeconds;
  }

  console.log("Reset timer! Thời gian thiết lập:", timerValue);
  multiplierFactor = 360 / timerValue;
  setInforCircularProgressBar(); // Cập nhật hiển thị giao diện

  document.getElementById("startPauseButton").textContent = "Start";
  document.getElementById("startPauseButton").style = "--start";
  document.getElementById("restartButton").style.display = "none";
};

// Cập nhật vòng tròn đếm ngược
function setInforCircularProgressBar() {
  if (timerValue > 0) {
    circularProgressBarNumber.textContent = `${formatNumberInStringMinute(
      timerValue
    )}`;
    circularProgressBar.style.background = `conic-gradient(var(--white) ${
      timerValue * multiplierFactor
    }deg, var(--pink-hover) 0deg)`;
  }
}

// Cập nhật hiển thị số Pomodoro
function updatePomodoroCountDisplay() {
  const pomodoroCountDisplay = document.getElementById("pomodoroCountDisplay");
  if (pomodoroCountDisplay) {
    pomodoroCountDisplay.textContent = `Pomodoro Sessions: ${pomodoroCount}`;
  }
}

// Thao tác nút Start / Pause
function toggleStartPause() {
  audio_click.play();
  const startPauseButton = document.getElementById("startPauseButton");
  const restartButton = document.getElementById("restartButton");
  if (!isRunning || isPaused) {
    if (!isRunning) restartButton.style.display = "block";
    startTimer(); // Bắt đầu đếm giờ
    isRunning = true;
    isPaused = false;
    startPauseButton.textContent = "Pause";
    startPauseButton.style.backgroundColor = "var(--pause)";
  } else {
    pause();
    isRunning = false;
    isPaused = true;
    startPauseButton.textContent = "Start";
    startPauseButton.style.backgroundColor = "var(--start)";
  }
}

const pause = () => {
  audio_click.play();
  clearInterval(progressInterval);
};

// Đặt mode Pomodoro / Break
const setPomodoroType = (type) => {
  audio_click.play();
  pomodoroType = type;

  // Xóa active class trên các nút
  buttonTypeShortBreak.classList.remove("active");
  buttonTypeLongBreak.classList.remove("active");
  buttonTypePomodoro.classList.remove("active");

  // Đặt active class theo loại hiện tại
  if (type === TIMER_TYPE_POMODORO) {
    buttonTypePomodoro.classList.add("active");
  } else if (type === TIMER_TYPE_SHORT_BREAK) {
    buttonTypeShortBreak.classList.add("active");
  } else {
    buttonTypeLongBreak.classList.add("active");
  }

  resetTimer(); // Reset lại thời gian cho loại mới
};

// lấy biến dùng cho Setting
const modal = document.getElementById("settingsModal");
const openSettingsBtn = document.getElementById("openSettingsBtn");
const closeModal = document.querySelector(".close");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const themeSelect = document.getElementById("themeSelect");

const pomodoroTimeInput = document.getElementById("pomodoroTime");
const shortBreakTimeInput = document.getElementById("shortBreakTime");
const longBreakTimeInput = document.getElementById("longBreakTime");

// Mở modal = icon settings
openSettingsBtn.addEventListener("click", () => {
  audio_click.play();
  modal.style.display = "block";
});

// Đóng modal = nút X
closeModal.addEventListener("click", () => {
  audio_click.play();
  modal.style.display = "none";
});

// Đóng modal khi nhấp ra ngoài
window.addEventListener("click", (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
});

// chọn theme
let currentTheme = "default";
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

themeSelect.addEventListener("input", (event) => {
  const selectedTheme = event.target.value;
  applyTheme(selectedTheme);
});

//Lưu cài đặt = nút Save
saveSettingsBtn.addEventListener("click", () => {
  audio_click.play();
  const selectedTheme = themeSelect.value;
  currentTheme = selectedTheme;
  applyTheme(currentTheme);
  saveData();
  modal.style.display = "none";

  resetTimer();
});

function saveData() {
  localStorage.setItem("selectedTheme", themeSelect.value);

  const newPomodoroTime = parseInt(pomodoroTimeInput.value) || 25;
  const newShortBreakTime = parseInt(shortBreakTimeInput.value) || 5;
  const newLongBreakTime = parseInt(longBreakTimeInput.value) || 15;

  localStorage.setItem("newPomodoroTime", newPomodoroTime);
  localStorage.setItem("newShortBreakTime", newShortBreakTime);
  localStorage.setItem("newLongBreakTime", newLongBreakTime);

  pomodoroTimerInSeconds = newPomodoroTime * 60;
  shortBreakTimerInSeconds = newShortBreakTime * 60;
  longBreakTimerInSeconds = newLongBreakTime * 60;
}

// Hàm gửi thông báo
function sendNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body: body,
      icon: "icon.png",
    });
  }
}

// Kiểm tra quyền thông báo
function checkNotificationPermission() {
  if (Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
      if (permission !== "granted") {
        console.log("Notification permission denied.");
      }
    });
  }
}

checkNotificationPermission();

// Lưu cài đặt khi load lại trang
function loadSettings() {
  savedTheme = localStorage.getItem("selectedTheme");
  applyTheme(savedTheme);

  pomodoroTimeInput.value = localStorage.getItem("newPomodoroTime");
  shortBreakTimeInput.value = localStorage.getItem("newShortBreakTime");
  longBreakTimeInput.value = localStorage.getItem("newLongBreakTime");

  // Cập nhật thời gian cho các biến
  pomodoroTimerInSeconds = pomodoroTimeInput.value * 60;
  shortBreakTimerInSeconds = shortBreakTimeInput.value * 60;
  longBreakTimerInSeconds = longBreakTimeInput.value * 60;

  resetTimer();
}

window.onload = function () {
  loadSettings();
};

// Lấy phần tử nút Default
const defaultSettingsBtn = document.getElementById("defaultSettingsBtn");

// Hàm đặt tất cả cài đặt về mặc định
function resetToDefault() {
  audio_click.play();
  //deleteAllTasks();
  localStorage.removeItem("pomodoroTime");
  localStorage.removeItem("shortBreakTime");
  localStorage.removeItem("longBreakTime");
  localStorage.removeItem("theme");

  // Đặt lại giá trị mặc định cho thời gian Pomodoro, Short Break, Long Break
  pomodoroTimeInput.value = 25;
  shortBreakTimeInput.value = 5;
  longBreakTimeInput.value = 15;

  // Đặt lại thời gian cho các biến
  pomodoroTimerInSeconds = 25 * 60;
  shortBreakTimerInSeconds = 5 * 60;
  longBreakTimerInSeconds = 15 * 60;

  resetTimer();
  // Đặt lại theme về mặc định
  applyTheme("default");
  themeSelect.value = "default"; // Đặt lại giá trị của select box về mặc định
  modal.style.display = "none";
  saveData();
}

// Xử lý sự kiện khi nhấn nút "Default"
defaultSettingsBtn.addEventListener("click", () => {
  audio_click.play();
  resetToDefault();
});

// Add Task
// Lấy các phần tử từ DOM
const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const deleteAllButton = document.getElementById("deleteAllButton");

// Mảng lưu trữ task
let tasks = [];

// sự kiện thêm task
addTaskButton.addEventListener("click", addTask);
deleteAllButton.addEventListener("click", deleteAllTasks);

// sự kiện nhấn phím "Enter" khi nhập task
taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

function addTask() {
  audio_click.play();
  const taskText = taskInput.value.trim();
  if (taskText === "") return;

  const task = {
    text: taskText,
    completed: false,
  };

  tasks.push(task);
  renderTasks();
  taskInput.value = ""; // Clear input sau khi thêm task
}

function toggleTaskCompletion(index) {
  tasks[index].completed = !tasks[index].completed;
  tasks.sort((a, b) => a.completed - b.completed);
  renderTasks();
}

function editTask(index) {
  const taskItem = taskList.children[index]; // Lấy phần tử nhiệm vụ trong danh sách
  const taskText = taskItem.querySelector("span"); // Lấy phần tử tên nhiệm vụ

  const input = document.createElement("input"); // Tạo ô nhập mới
  input.type = "text";
  input.value = taskText.textContent; // Đặt giá trị mặc định là tên hiện tại
  input.className = "edit-task-input"; // Thêm class cho ô nhập

  // Thay thế tên nhiệm vụ bằng ô nhập
  taskItem.replaceChild(input, taskText);
  // Tập trung vào ô nhập để người dùng có thể nhập ngay
  input.focus();

  // nhấn Enter để lưu tên mới
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const newTaskText = input.value.trim();
      if (newTaskText !== "") {
        tasks[index].text = newTaskText; // Cập nhật tên nhiệm vụ
        renderTasks(); // Hiển thị lại danh sách nhiệm vụ
      }
    }
  });

  //nhấn ra ngoài để hủy việc chỉnh sửa
  input.addEventListener("blur", () => {
    const newTaskText = input.value.trim();
    if (newTaskText !== "") {
      tasks[index].text = newTaskText;
    }
    renderTasks();
  });
}

function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
}

function deleteAllTasks() {
  audio_click.play();
  tasks = [];
  renderTasks();
}

// Hàm hiển thị task
function renderTasks() {
  taskList.innerHTML = ""; // Xóa danh sách hiện tại

  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  const allTasks = [...incompleteTasks, ...completedTasks];

  allTasks.forEach((task, index) => {
    audio_click.play();
    const taskItem = document.createElement("li");
    taskItem.classList.add("task-item");

    // Checkbox để đánh dấu hoàn thành
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTaskCompletion(index));

    const taskText = document.createElement("span");
    taskText.textContent = task.text;
    taskText.style.textDecoration = task.completed ? "line-through" : "none";

    // Nút dấu ba chấm để hiển thị menu tùy chọn
    const optionsButton = document.createElement("div");
    optionsButton.className = "task-options";
    optionsButton.textContent = '\u22EE'; // đổi icon
    optionsButton.addEventListener("click", () => toggleOptionsMenu(index));

    // Menu tùy chọn (edit và delete)
    const optionsMenu = document.createElement("div");
    optionsMenu.className = "task-options-menu";
    optionsMenu.style.display = "none"; // Ẩn menu mặc định

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      audio_click.play();
      editTask(index);
      closeAllOptionsMenus();
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      audio_click.play();
      deleteTask(index);
      closeAllOptionsMenus();
    });

    optionsMenu.appendChild(editButton);
    optionsMenu.appendChild(deleteButton);

    // Thêm các phần tử vào danh sách
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(optionsButton);
    taskItem.appendChild(optionsMenu);

    taskList.appendChild(taskItem);
  });
}

// Hàm để mở/đóng menu tùy chọn
function toggleOptionsMenu(index) {
  audio_click.play();
  const menus = document.querySelectorAll(".task-options-menu");
  menus.forEach((menu, i) => {
    if (i === index) {
      // Nếu menu hiện tại đang ẩn, thì hiển thị nó, nếu đang hiển thị thì ẩn nó
      menu.style.display = menu.style.display === "block" ? "none" : "block";
    } else {
      menu.style.display = "none"; // Đóng các menu khác
    }
  });
}

// Đóng tất cả các menu tùy chọn
function closeAllOptionsMenus() {
  audio_click.play();
  const menus = document.querySelectorAll(".task-options-menu");
  menus.forEach((menu) => {
    menu.style.display = "none";
  });
}

// di chuyển mắt
const eyeLeft = document.querySelector("#left-eye .pupil");
const eyeRight = document.querySelector("#right-eye .pupil");
const tomato = document.getElementById("tomato-container");

document.addEventListener("mousemove", (event) => {
  movePupil(event, eyeLeft, "#left-eye");
  movePupil(event, eyeRight, "#right-eye");
});

function movePupil(event, pupil, eyeSelector) {
  const eye = document.querySelector(eyeSelector);
  const eyeRect = eye.getBoundingClientRect();
  const eyeCenterX = eyeRect.left + eyeRect.width / 2;
  const eyeCenterY = eyeRect.top + eyeRect.height / 2;

  const dx = event.pageX - eyeCenterX;
  const dy = event.pageY - eyeCenterY;
  const angle = Math.atan2(dy, dx);

  const distance = Math.min(eyeRect.width / 4, Math.hypot(dx, dy)); // Giới hạn khoảng di chuyển con ngươi bên trong mắt

  const offsetX = Math.cos(angle) * distance;
  const offsetY = Math.sin(angle) * distance;

  pupil.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}

// di chuyển quả cà chua
const tomatoContainer = document.getElementById("tomato-container");
let isDragging = false;
let offsetX, offsetY;

tomatoContainer.addEventListener("mousedown", (event) => {
  audio_tomato.play();
  isDragging = true;
  offsetX = event.offsetX;
  offsetY = event.offsetY;
  tomatoContainer.style.cursor = "grabbing";
});

document.addEventListener("mouseup", () => {
  //audio_iwa.play();
  isDragging = false;
  tomatoContainer.style.cursor = "grab";
});

document.addEventListener("mousemove", (event) => {
  if (isDragging) {
    tomatoContainer.style.top = `${event.clientY - offsetY}px`;
    tomatoContainer.style.left = `${event.clientX - offsetX}px`;
  }
});




