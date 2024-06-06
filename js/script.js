var defaultConfig = {
	"canvasSize": 50,       // 画布大小
	"livingMin": 2,         // 存活细胞继续存活的最小值
	"livingMax": 3,         // 存活细胞继续存活的最大值
	"deadMin": 3,           // 死亡细胞继续存活的最小值
	"deadMax": 3,           // 死亡细胞继续存活的最大值
	"cycleTime": 500,       // 循环周期 单位毫秒
};

var config = { ...defaultConfig };

// 文本框触发 `onchange` 输入参数改变时执行的函数
function onChangeConfig(configName) {
	if (document.getElementById(`input-${configName}`).value) {
		config[configName] = Number(document.getElementById(`input-${configName}`).value);
	}
	else {
		config[configName] = defaultConfig[configName];
	}
	log(configName, config[configName]);
}

// 创建表格
function createTable() {
	table = document.getElementById('automation-table');

	while (table.firstChild) {
		table.removeChild(table.firstChild);
	}

	for (let i = 0; i < config["canvasSize"]; i++) {
		const row = document.createElement('tr');
		row.setAttribute('class', 'automation-row');
		row.setAttribute('id', `automation-row-${i}`);
		row.setAttribute('row', String(i));

		for (let j = 0; j < config["canvasSize"]; j++) {
			const box = document.createElement('td');
			box.setAttribute('class', 'automation-box');
			box.setAttribute('id', `automation-box-${i}-${j}`);
			box.setAttribute('onmousedown', `changeBoxColor(getBox(${i}, ${j}));`);        // 方便点击改颜色
			box.setAttribute('row', String(i));                                         // 行
			box.setAttribute('column', String(j));                                      // 列
			box.style.backgroundColor = "white";

			row.appendChild(box);
		}

		table.appendChild(row);
	}
}

function isShownColorBlack(box) {
	if (box.style.backgroundColor == "black") {
		return true;
	}
	return false;
}

// 更改颜色
function changeBoxColor(box) {
	if (isShownColorBlack(box)) {
		box.style.backgroundColor = "white";
	}
	else {
		box.style.backgroundColor = "black";
	}
}

// 指定颜色
function assignBoxColor(box, color) {
	if ((color != "black") & (color != "white")) {
		alert("Color must be either black or white");
		throw new Error("Color must be either black or white");
	}
	box.style.backgroundColor = color;
}

// 计算下一步中细胞存活情况
function needBoxChange(box) {
	var alive = false;

	if (isShownColorBlack(box)) {
		alive = true;
	}

	var numLivingNeighbor = 0;

	x = Number(box.getAttribute('row'));
	y = Number(box.getAttribute('column'));

	lstOfBoxesPosition = [
		[x - 1, y - 1], [x - 1, y], [x - 1, y + 1],
		[x, y - 1], [x, y + 1],
		[x + 1, y - 1], [x + 1, y], [x + 1, y + 1],
	]

	for (let i = 0; i < lstOfBoxesPosition.length; i++) {
		if (getBox(...lstOfBoxesPosition[i]) != null) {
			if (isShownColorBlack(getBox(...lstOfBoxesPosition[i]))) {
				numLivingNeighbor += 1
			}
		}
	}

	if (alive) {    // 活细胞
		if (numLivingNeighbor >= config["livingMin"] & numLivingNeighbor <= config["livingMax"]) {
			return false;
		}
		else {
			return true;
		}
	}
	else {      // 死细胞
		if (numLivingNeighbor >= config["deadMin"] & numLivingNeighbor <= config["deadMax"]) {
			return true;
		}
		else {
			return false;
		}
	}
}

// 走一步
function step() {
	let nextStatusNeedChange = [];

	for (let i = 0; i < config['canvasSize']; i++) {
		tmpLst = [];
		for (let j = 0; j < config['canvasSize']; j++) {
			tmpLst.push(needBoxChange(getBox(i, j)));
		};
		nextStatusNeedChange.push(tmpLst);
	};

	for (let i = 0; i < config['canvasSize']; i++) {
		for (let j = 0; j < config['canvasSize']; j++) {
			if (nextStatusNeedChange[i][j]) {
				changeBoxColor(getBox(i, j));
			};
		};
	};

	log("Gone one step");
};

// 指向某个细胞
function getBox(x, y) {
	return document.getElementById('automation-box-' + String(x) + '-' + String(y))
}

const timerController = {
	intervalId: null,

	// 开始运行step函数
	run: function (callback, interval) {
		if (this.intervalId === null) {
			this.intervalId = setInterval(callback, interval);
		}
	},

	// 暂停计时器
	pause: function () {
		if (this.intervalId !== null) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	},

	// 继续运行step函数
	resume: function (callback, interval) {
		if (this.intervalId === null) {
			this.intervalId = setInterval(callback, interval);
		}
	}
};

document.getElementById('button-start-pause').addEventListener("click", () => {
	buttonStartPause = document.getElementById('button-start-pause');
	if (buttonStartPause.getAttribute("status") === "start") {
		// 点击开始运行
		buttonStartPause.setAttribute("status", "running");
		buttonStartPause.setAttribute("title", "暂停循环");
		buttonStartPause.textContent = "暂停 循环运行";
		timerController.run(step, config["cycleTime"]);
		log("Cycle started");
	}
	else if (buttonStartPause.getAttribute("status") === "running") {
		// 点击暂停
		buttonStartPause.setAttribute("status", "paused");
		buttonStartPause.setAttribute("title", "继续运行循环");
		buttonStartPause.textContent = "继续 循环运行";
		timerController.pause();
		log("Cycle paused");
	}
	else if (buttonStartPause.getAttribute("status") === "paused") {
		// 点击继续运行
		buttonStartPause.setAttribute("status", "running")
		buttonStartPause.setAttribute("title", "暂停循环")
		buttonStartPause.textContent = "暂停 循环运行"
		timerController.resume(step, config["cycleTime"]);
		log("Cycle continued")
	};
});

document.getElementById("button-reset").addEventListener("click", () => {
	if (document.getElementById('button-start-pause').getAttribute("status") === "running") {
		buttonStartPause.setAttribute("status", "start");
		buttonStartPause.setAttribute("title", "以循环周期为间隔循环计算并呈现游戏的下一步");
		buttonStartPause.textContent = "开始 循环运行";
		timerController.pause();
		log("Cycle reset");
	};
	
	createTable();
	
});

// 用于调试输出
function log(...data) {
	console.log(...data, new Date())
};

// 显示目前的棋盘状态
function getCurrentCanvasStatus() {
	let currentCanvasStatus = [];

	for (let i = 0; i < config['canvasSize']; i++) {
		tmpLst = [];
		for (let j = 0; j < config['canvasSize']; j++) {
			tmpLst.push(Number(isShownColorBlack(getBox(i, j))));
		};
		currentCanvasStatus.push(tmpLst);
	};
	return currentCanvasStatus;
};

// 读取存储的初始状态信息
async function getInitStatusJSON() {
	try {
		// 发起请求获取 initStatus.json 内容
		const response = await fetch('./initStatus.json');
		
		// 检查请求是否成功
		if (!response.ok) {
			throw new Error(`HTTP error, code ${response.status}`);
		}
		
		// 将响应解析为 JSON 格式
		const data = await response.json();

		for (let i = 0; i < data.length; i++) {
			document.getElementById('init-name').appendChild(parseStatus(data[i], i));
		}
	}
	catch (error) {
		const errMessage = document.createElement('p');
		errMessage.setAttribute('class', 'init-items');
		errMessage.textContent = "若看到这行提示，说明预设的初始内容示例没有加载成功，请刷新重试！";
		errMessage.style.color = "red";
		document.getElementById('init-name').appendChild(errMessage);
		console.error('Error when loading JSON', error);
	}
};
// 解析单个status
function parseStatus(status, id) {
	let size = status["canvasSize"];
	let info = status["canvasInfo"];
	let name = status["name"];

	const statLink = document.createElement('a');
	statLink.setAttribute('href', '#');
	statLink.setAttribute('onclick', 'onClickInitialStatus("' + JSON.stringify([size, info]) + '");');
	statLink.setAttribute('class', 'init-items')
	statLink.text = name;

	return statLink;
};

// 将某个 initStatus 加到棋盘上
function onClickInitialStatus(statusJSONString) {
	let [size, info] = JSON.parse(statusJSONString);
	document.getElementById('input-canvasSize').value = size;
	config["canvasSize"] = size;
	createTable();

	// 填充黑色块
	for (let i = 0; i < config['canvasSize']; i++) {
		for (let j = 0; j < config['canvasSize']; j++) {
			if (info[i][j]) {
				changeBoxColor(getBox(i, j));
			};
		};
	};
};

getInitStatusJSON();

createTable();
