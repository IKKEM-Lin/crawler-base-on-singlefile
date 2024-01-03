// ==UserScript==
// @name              Crawler base on SingleFile
// @author            Mark
// @description       Download site in single file automatically
// @license           MIT
// @version           0.0.10
// @match             https://*/*
// @run-at            document-idle
// @grant GM.setValue
// @grant GM.getValue
// @grant GM.xmlHttpRequest
// @grant GM_registerMenuCommand
// @grant unsafeWindow
// @require     https://update.greasyfork.org/scripts/483730/1305396/gm-fetch.js
// @connect *
// @noframes
// ==/UserScript==


const addScript = (url) => {
    const s = document.createElement("script");
    s.src = url;
    document.body.append(s);
};

const generateClientId = () =>
    (1e6 * Math.random()).toString(32).replace(".", "");
// main function
(function () {
    "use strict";

    addScript(
        "https://cdn.jsdelivr.net/gh/IKKEM-Lin/crawler-base-on-singlefile/config.js"
    );
    addScript(
        "https://cdn.jsdelivr.net/gh/IKKEM-Lin/crawler-base-on-singlefile/validator.js"
    );
    addScript(
        "https://cdn.jsdelivr.net/gh/gildas-lormeau/SingleFile-MV3/lib/single-file-bootstrap.js"
    );
    addScript(
        "https://cdn.jsdelivr.net/gh/gildas-lormeau/SingleFile-MV3/lib/single-file-hooks-frames.js"
    );
    addScript(
        "https://cdn.jsdelivr.net/gh/gildas-lormeau/SingleFile-MV3/lib/single-file-frames.js"
    );
    // Overwrite fetch function to bypass CORS
    window.unsafeWindow.fetch = async (...args) => {
        return await fetch(...args).catch(async (err) => {
            return await GM_fetch(...args);
        });
    };

    const downloadFile = (data, fileName) => {
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        const blob = new Blob([data], {
            type: "application/octet-stream",
        });
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const sleep = (duration) => {
        return new Promise((res, rej) => {
            setTimeout(() => res(), duration * 1000);
        });
    };

    async function reload(waiting = 60, message = "") {
        console.warn(`%c${message}, reload ${waiting}s later`, printStyle);
        await sleep(waiting);
        location.reload();
    }

    function readFile(accept = "", multiple = false) {
        const inputEl = document.createElement("input");
        inputEl.setAttribute("type", "file");
        inputEl.setAttribute("accept", accept);
        inputEl.setAttribute("multiple", !!multiple);
        return new Promise((resolve, reject) => {
            inputEl.addEventListener("change", (e) => {
                resolve(multiple ? inputEl.files : inputEl.files[0]);
                window.removeEventListener("click", onWindowClick, true);
            });
            document.body.append(inputEl);
            inputEl.click();

            const onWindowClick = () => {
                if (!inputEl.value) {
                    reject(new Error("用户取消选择"));
                }
                window.removeEventListener("click", onWindowClick, true);
            };
            setTimeout(() => {
                window.addEventListener("click", onWindowClick, true);
            }, 100);
        });
    }

    function AddImportBtn() {
        const btnWrapImport = document.createElement("div");
        btnWrapImport.id = "CRAWLER_ID";
        btnWrapImport.innerHTML = `<button style="padding: 4px 8px;position: fixed;bottom: 40%;right: 8px;border-radius: 4px;background-color: #224466;color: #fff;">Import</button>`;
        const importBtn = btnWrapImport.querySelector("button");
        importBtn.onclick = async () => {
            if (
                !window.confirm(
                    "The data in browser will be clear up. Please make sure you have to do this !!!"
                )
            ) {
                return;
            }
            const file = await readFile(".json");
            const reader = new FileReader();

            reader.onload = (event) => {
                const json = JSON.parse(event.target.result);
                // console.log({json}, 'json')
                // this.importFromBackUp.bind(this)(json);
                if (
                    json instanceof Array &&
                    json.every((item) => item.doi && item.validator)
                ) {
                    GM.setValue("tasks", json);
                    location.reload();
                } else {
                    alert(
                        "Please upload json file like [{doi: string, validator: string, ...}]"
                    );
                }
            };

            reader.readAsText(file);
        };
        document.body.appendChild(btnWrapImport);
    }

    function removeImportBtn() {
        const importBtn = document.getElementById("CRAWLER_ID");
        if (importBtn) {
            importBtn.parentElement.removeChild(importBtn);
        }
    }

    GM_registerMenuCommand("Download", async () => {
        const taskData = await GM.getValue("tasks");
        const waitingTasks = taskData.filter(
            (task) =>
                !task.downloaded &&
                task.validated === undefined &&
                validators[task.validator]
        );
        const now = new Date();
        downloadFile(
            JSON.stringify(taskData),
            `${now.getFullYear()}-${now.getMonth() + 1
            }-${now.getDate()}-${now.getHours()}${now.getMinutes()}${now.getSeconds()}-${taskData.length
            }-${taskData.length - waitingTasks.length}.json`
        );
    });

    const printStyle = "color: blue;background-color: #ccc;font-size: 20px";

    async function start() {
        console.log(new Date());
        AddImportBtn();
        await sleep(7);
        addScript(
            "https://cdn.jsdelivr.net/gh/gildas-lormeau/SingleFile-MV3/lib/single-file.js"
        );
        const taskData = await GM.getValue("tasks");
        let tasks = taskData || [];

        // find task which not downloaded and not validated before
        const waitingTasks = tasks.filter(
            (task) =>
                !task.downloaded &&
                task.validated === undefined &&
                validators[task.validator]
        );
        console.log(
            `%cTry to get tasks firstly(${waitingTasks.length} / ${tasks.length}):`,
            printStyle,
            tasks
        );

        // ---------------------------- Report progress -----------------------------------------------------

        let clientId = await GM.getValue("clientId");
        if (typeof clientId !== "string" || !clientId) {
            clientId = generateClientId();
            await GM.setValue("clientId", clientId);
        }
        const invalidatedTasks = tasks.filter((task) => task.validated === false);
        const doneTasks = tasks
            .filter((task) => task.downloaded)
            .sort((a, b) => (a.updateTime > b.updateTime ? -1 : 1));
        const previousDay = new Date().valueOf() - 24 * 3600 * 1000;
        const last24hDoneTasks = doneTasks.filter(task => task.updateTime > previousDay);
        const lastDoneTime = new Date(doneTasks[0]?.updateTime);
        const reportTip = `Last download time: ${lastDoneTime.toLocaleString()}
        Speed: ${last24hDoneTasks.length} / last 24h`;
        GM.xmlHttpRequest({
            url: "https://crawler-hit.deno.dev/api/update",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({
                account: clientId,
                invalidate_count: invalidatedTasks.length,
                done_count: doneTasks.length,
                queue_count: waitingTasks.length,
                tip: reportTip,
            }),
        }).then((res) => {
            window.tts = res;
            console.log({ res });
        });

        if (!waitingTasks.length) {
            await reload(90, "No tasks waiting");
            return;
        }

        // -------------------------- Detect Cloudflare challenge -------------------------------------------------------
        await sleep(10);
        const currentTask = waitingTasks[0];
        const doi = currentTask.doi.replace("https://doi.org/", "").toLowerCase();
        const validator = validators[currentTask.validator];
        if (document.getElementById("challenge-form")) {
            console.log(`%cCloudflare challenge! ${currentTask.doi}`, printStyle);
            await sleep(20);
            currentTask.validated = false;
            currentTask.cloudflareBlock = true;
        }

        // --------------------------- Page validate ------------------------------------------------------
        if (
            !currentTask.cloudflareBlock &&
            !document.body.textContent.toLowerCase().includes(doi)
        ) {
            console.log(
                `%cURL not match, will redirect to ${currentTask.doi} 5s later`,
                printStyle
            );
            await sleep(5);
            location.href = currentTask.doi;
            return;
        }
        if (!currentTask.cloudflareBlock && validator(document)) {
            console.log(
                "%cValidate successfully! Downloading page...",
                printStyle,
                waitingTasks,
                tasks
            );
            removeImportBtn();
            // repair special page
            if (typeof documentFixer[currentTask.validator] === "function") {
                documentFixer[currentTask.validator](document);
            }
            try {
                const data = await singlefile.getPageData(DEFAULT_CONFIG);
                downloadFile(
                    data.content,
                    `${doi.replaceAll("/", "_")}.singlefile.html`
                );
                downloadFile(
                    document.body.parentElement.outerHTML,
                    `${doi.replaceAll("/", "_")}.html`
                );
                currentTask.downloaded = true;
                currentTask.validated = true;
                currentTask.updateTime = new Date().valueOf();
            } catch (error) {
                console.error(error);
                await reload(10, `singlefile error! ${currentTask.doi}`);
                return;
            }
        } else {
            console.log(`%cValidate failed! ${currentTask.doi}`, printStyle);
            currentTask.validated = false;
            currentTask.updateTime = new Date().valueOf();
        }

        await GM.setValue("tasks", tasks);

        // --------------------------- Prepare next task ------------------------------------------------------
        const nextTask = waitingTasks[1];
        if (nextTask) {
            console.log(
                `%cStart next task 10s later...`,
                printStyle,
                nextTask.doi,
                tasks
            );
            await sleep(10);
            location.href = nextTask.doi;
        } else {
            await reload(60, "No tasks waiting");
        }
    }

    start();
})();
