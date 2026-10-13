const message = document.getElementById('bookingMessage');

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (!sidebar || !toggleBtn) return;

    const isCollapsed = sidebar.classList.toggle('is-collapsed');
    toggleBtn.classList.toggle('is-collapsed', isCollapsed);
    toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
}


import { auth, db } from "../firebase.config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";



// CONFIGURATION
// Change these names to match your database.


const COLLECTIONS = {
    learners: "Learners",
    tasks: "LearnerTasks",
    bookings: "BookingSessions",
    games: "GameResults"
};


// ELEMENTS


const reportType = document.getElementById("reportType");
const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
const reportLearner = document.getElementById("reportLearner");

const showReportsBtn = document.getElementById("showReportsBtn");
const reportsMessage = document.getElementById("reportsMessage");

const reportTableHead = document.getElementById("reportTableHead");
const reportTableBody = document.getElementById("reportTableBody");

const reportPreviewTitle = document.getElementById("reportPreviewTitle");
const downloadCurrentReport = document.getElementById(
    "downloadCurrentReport"
);


// STATE


let currentUser = null;
let learners = [];
let tasks = [];
let bookings = [];
let games = [];

let currentReportRows = [];
let currentReportColumns = [];

// SAFE FIELD HELPERS


function firstValue(object, fields, fallback = "") {
    for (const field of fields) {
        const value = object?.[field];

        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }

    return fallback;
}

function learnerId(record) {
    return String(
        firstValue(
            record,
            ["learnerUid", "learnerId", "uid", "learnerID"],
            ""
        )
    );
}

function learnerName(record) {
    const combined = firstValue(
        record,
        ["learnerName", "displayName"],
        ""
    );

    if (combined) return String(combined);

    const first = firstValue(record, ["name", "firstName"], "");
    const last = firstValue(record, ["surname", "lastName"], "");

    return `${first} ${last}`.trim() || "Unknown learner";
}

function timestampDate(value) {
    if (!value) return null;

    if (typeof value.toDate === "function") {
        return value.toDate();
    }

    if (value instanceof Date) {
        return value;
    }

    if (typeof value === "number") {
        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    if (typeof value === "string") {
        // Support YYYY-MM-DD date-only values.
        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

        const date = match
            ? new Date(
                Number(match[1]),
                Number(match[2]) - 1,
                Number(match[3])
            )
            : new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    return null;
}

function recordDate(record) {
    return timestampDate(
        firstValue(
            record,
            [
                "createdAt",
                "completedAt",
                "sessionDate",
                "gameDate",
                "playedAt",
                "date",
                "dueDate"
            ],
            null
        )
    );
}

function formatDate(value) {
    const date = timestampDate(value);

    if (!date) return "—";

    return date.toLocaleDateString("en-ZA");
}

function escapeCsv(value) {
    let text = String(value ?? "");

    // Prevent spreadsheet formula injection.
    if (/^[\s]*[=+\-@]/.test(text)) {
        text = "'" + text;
    }

    return `"${text.replace(/"/g, '""')}"`;
}



// LOAD COLLECTIONS


async function loadCollection(collectionName) {
    const snapshot = await getDocs(
        collection(db, collectionName)
    );

    return snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data()
    }));
}

async function loadAllReportsData() {
    reportsMessage.textContent = "Loading reports, please wait..";

    const results = await Promise.allSettled([
        loadCollection(COLLECTIONS.learners),
        loadCollection(COLLECTIONS.tasks),
        loadCollection(COLLECTIONS.bookings),
        loadCollection(COLLECTIONS.games)
    ]);

    const [learnerResult, taskResult, bookingResult, gameResult] =
        results;

    const failedCollections = [];

    if (learnerResult.status === "fulfilled") {
        learners = learnerResult.value;
    } else {
        learners = [];
        failedCollections.push(COLLECTIONS.learners);
        console.error("Could not load learners:", learnerResult.reason);
    }

    if (taskResult.status === "fulfilled") {
        tasks = taskResult.value;
    } else {
        tasks = [];
        failedCollections.push(COLLECTIONS.tasks);
        console.error("Could not load tasks:", taskResult.reason);
    }

    if (bookingResult.status === "fulfilled") {
        bookings = bookingResult.value;
    } else {
        bookings = [];
        failedCollections.push(COLLECTIONS.bookings);
        console.error("Could not load bookings:", bookingResult.reason);
    }

    if (gameResult.status === "fulfilled") {
        games = gameResult.value;
    } else {
        games = [];
        failedCollections.push(COLLECTIONS.games);
        console.warn(
            `Could not load ${COLLECTIONS.games}. ` +
            "Check its name and try again.",
            gameResult.reason
        );
    }

    populateLearnerDropdown();
    updateStatistics();
    applyReportFilters();

    if (failedCollections.length) {
        reportsMessage.textContent =
            "Some data could not be loaded: " +
            failedCollections.join(", ") +
            ". Check the collection names.";
    } else {
        reportsMessage.textContent =
            `Reports loaded successfully. ${learners.length} learners found.`;
    }
}


// LEARNER FILTER


function populateLearnerDropdown() {
    reportLearner.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Learners";

    reportLearner.appendChild(allOption);

    learners
        .slice()
        .sort((a, b) =>
            learnerName(a).localeCompare(learnerName(b))
        )
        .forEach((learner) => {
            const option = document.createElement("option");

            // Use the Firestore document ID for filtering.
            option.value = learner.id;
            option.textContent = learnerName(learner);

            reportLearner.appendChild(option);
        });
}



// STATUS HELPERS


function normalizedStatus(record) {
    return String(
        firstValue(record, ["status", "taskStatus"], "")
    ).trim().toLowerCase();
}

function isCompleted(task) {
    return [
        "completed",
        "complete",
        "done",
        "submitted",
        "finished"
    ].includes(normalizedStatus(task));
}

function isOutstanding(task) {
    return !isCompleted(task);
}

function belongsToLearner(record, selectedId) {
    if (selectedId === "all") return true;

    const selectedLearner = learners.find(
        (learner) => learner.id === selectedId
    );

    if (!selectedLearner) return false;

    const ids = [
        selectedLearner.id,
        selectedLearner.uid
    ].filter(Boolean).map(String);

    const recordUid = learnerId(record);

    // Support records referencing either the learner document ID or the Firebase learner UID.
    return ids.includes(recordUid);
}


// DATE FILTERS


function withinDateRange(record) {
    const start = fromDate.value
        ? timestampDate(fromDate.value)
        : null;

    const end = toDate.value
        ? timestampDate(toDate.value)
        : null;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    if (!start && !end) return true;

    const date = recordDate(record);

    // A date range cannot be verified if the record has no date.
    if (!date) return false;

    if (start && date < start) return false;
    if (end && date > end) return false;

    return true;
}

// PROGRESS AND GAME SCORES


function taskProgressForLearner(learner) {
    const learnerTasks = tasks.filter(
        (task) => belongsToLearner(task, learner.id)
    );

    if (!learnerTasks.length) return null;

    const completed = learnerTasks.filter(isCompleted).length;

    return (completed / learnerTasks.length) * 100;
}

function numericGameScore(game) {
    const raw = firstValue(
        game,
        ["scorePercentage", "percentage", "score", "gameScore"],
        null
    );

    if (raw === null || raw === "") return null;

    const score = Number(raw);

    if (!Number.isFinite(score)) return null;

    // Assumes values above 100 represent points rather than percentages.
    // Adjust this mapping if your games use another scoring scale.
    return score;
}

function formatPercent(value) {
    return value === null || !Number.isFinite(value)
        ? "—"
        : `${Math.round(value)}%`;
}

function average(values) {
    const valid = values.filter(
        (value) => Number.isFinite(value)
    );

    if (!valid.length) return null;

    return valid.reduce((sum, value) => sum + value, 0)
        / valid.length;
}


// DASHBOARD STATISTICS


function setText(id, value) {
    document.getElementById(id).textContent = value;
}

function updateStatistics() {
    const selectedId = reportLearner.value || "all";

    const selectedTasks = tasks.filter(
        (task) => belongsToLearner(task, selectedId)
    );

    const selectedGames = games.filter(
        (game) => belongsToLearner(game, selectedId)
    );

    const completedCount = selectedTasks.filter(isCompleted).length;

    const outstandingCount = selectedTasks.filter(
        isOutstanding
    ).length;

    const progressValues = learners
        .filter((learner) => belongsToLearner(learner, selectedId))
        .map(taskProgressForLearner)
        .filter((value) => value !== null);

    const gameScores = selectedGames
        .map(numericGameScore)
        .filter((value) => value !== null);

    setText(
        "totalLearners",
        selectedId === "all" ? learners.length : 1
    );

    setText("tasksCompleted", completedCount);
    setText("outstandingTasks", outstandingCount);

    setText(
        "averageProgress",
        formatPercent(average(progressValues))
    );

    setText(
        "averageGameScore",
        formatPercent(average(gameScores))
    );
}



// REPORT DEFINITIONS


function learnerRows() {
    return learners
        .filter((learner) =>
            belongsToLearner(learner, reportLearner.value)
        )
        .filter(withinDateRange)
        .map((learner) => ({
            "Learner": learnerName(learner),
            "Email": firstValue(learner, ["email"], "—"),
            "Learner ID": learner.uid || learner.id,
            "Tasks Completed": tasks.filter(
                (task) =>
                    belongsToLearner(task, learner.id) &&
                    isCompleted(task)
            ).length,
            "Outstanding Tasks": tasks.filter(
                (task) =>
                    belongsToLearner(task, learner.id) &&
                    isOutstanding(task)
            ).length,
            "Progress": formatPercent(
                taskProgressForLearner(learner)
            )
        }));
}

function taskRows() {
    return tasks
        .filter((task) =>
            belongsToLearner(task, reportLearner.value)
        )
        .filter(withinDateRange)
        .map((task) => ({
            "Learner": learnerNameFromRecord(task),
            "Task Title": firstValue(
                task,
                ["taskTitle", "title", "taskName"],
                "Untitled task"
            ),
            "Description": firstValue(
                task,
                ["taskDescription", "description"],
                "—"
            ),
            "Due Date": formatDate(task.dueDate),
            "Status": firstValue(task, ["status"], "Unknown"),
            "Created": formatDate(task.createdAt)
        }));
}

function learnerNameFromRecord(record) {
    const uid = learnerId(record);

    const learner = learners.find((item) =>
        [item.id, item.uid].filter(Boolean).map(String).includes(uid)
    );

    return learner
        ? learnerName(learner)
        : firstValue(record, ["learnerName"], "Unknown learner");
}

function bookingRows() {
    return bookings
        .filter((booking) =>
            belongsToLearner(booking, reportLearner.value)
        )
        .filter(withinDateRange)
        .map((booking) => ({
            "Learner": learnerNameFromRecord(booking),
            "Assessor": firstValue(
                booking,
                ["assessorName"],
                "—"
            ),
            "Session Type": firstValue(
                booking,
                ["sessionType"],
                "—"
            ),
            "Session Date": formatDate(
                booking.sessionDate
            ),
            "Session Time": firstValue(
                booking,
                ["sessionTime"],
                "—"
            ),
            "Status": firstValue(
                booking,
                ["status"],
                "Unknown"
            )
        }));
}

function gameRows() {
    return games
        .filter((game) =>
            belongsToLearner(game, reportLearner.value)
        )
        .filter(withinDateRange)
        .map((game) => ({
            "Learner": learnerNameFromRecord(game),
            "Game": firstValue(
                game,
                ["gameName", "gameTitle", "title"],
                "Game"
            ),
            "Score": numericGameScore(game) ?? "—",
            "Date": formatDate(
                firstValue(
                    game,
                    ["playedAt", "gameDate", "createdAt", "date"],
                    null
                )
            )
        }));
}



// BUILD CURRENT REPORT


function getReportDefinition(type) {
    switch (type) {
        case "learners":
            return {
                title: "Learner Reports",
                rows: learnerRows()
            };

        case "tasks":
            return {
                title: "Task Reports",
                rows: taskRows()
            };

        case "games":
            return {
                title: "Game Results Reports",
                rows: gameRows()
            };

        case "bookings":
            return {
                title: "Support Bookings Reports",
                rows: bookingRows()
            };

        default:
            return {
                title: "All Reports",
                rows: [
                    ...learnerRows(),
                    ...taskRows(),
                    ...bookingRows(),
                    ...gameRows()
                ]
            };
    }
}

function applyReportFilters() {
    updateStatistics();

    const definition = getReportDefinition(
        reportType.value || "all"
    );

    reportPreviewTitle.textContent = definition.title;

    currentReportRows = definition.rows;

    currentReportColumns = currentReportRows.length
        ? Object.keys(currentReportRows[0])
        : [];

    renderReportTable();

    if (!currentReportRows.length) {
        reportsMessage.textContent =
            "No report records match the selected filters.";
    } else {
        reportsMessage.textContent =
            `${currentReportRows.length} report record(s) found.`;
    }
}



// RENDER TABLE SAFELY


function renderReportTable() {
    reportTableHead.replaceChildren();
    reportTableBody.replaceChildren();

    if (!currentReportRows.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 1;
        cell.textContent = "No records found.";

        row.appendChild(cell);
        reportTableBody.appendChild(row);

        return;
    }

    const headerRow = document.createElement("tr");

    currentReportColumns.forEach((column) => {
        const th = document.createElement("th");
        th.scope = "col";
        th.textContent = column;
        headerRow.appendChild(th);
    });

    reportTableHead.appendChild(headerRow);

    currentReportRows.forEach((record) => {
        const row = document.createElement("tr");

        currentReportColumns.forEach((column) => {
            const cell = document.createElement("td");
            cell.textContent = String(record[column] ?? "—");
            row.appendChild(cell);
        });

        reportTableBody.appendChild(row);
    });
}



// DOWNLOAD CSV


function downloadCsv(type, rows) {
    if (!rows.length) {
        reportsMessage.textContent =
            "There are no records to download.";
        return;
    }

    const columns = [...new Set(
        rows.flatMap((row) => Object.keys(row))
    )];

    const csvContent = [
        columns.map(escapeCsv).join(","),
        ...rows.map((row) =>
            columns
                .map((column) => escapeCsv(row[column]))
                .join(",")
        )
    ].join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
        `skillstrack-${type}-report-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    reportsMessage.textContent =
        `${rows.length} record(s) exported successfully.`;
}

downloadCurrentReport.addEventListener("click", () => {
    downloadCsv(
        reportType.value || "all",
        currentReportRows
    );
});


// REPORT ACTION BUTTONS


document.querySelectorAll(".report-action-btn").forEach((button) => {
    button.addEventListener("click", () => {
        const type = button.dataset.report;

        reportType.value = type;
        applyReportFilters();

        // Open the browser print dialog for this report.
        // Users can print or choose "Save as PDF".
        window.print();
    });
});



// FILTER EVENTS


showReportsBtn.addEventListener("click", () => {
    if (
        fromDate.value &&
        toDate.value &&
        fromDate.value > toDate.value
    ) {
        reportsMessage.textContent =
            "From Date cannot be later than To Date.";
        return;
    }

    applyReportFilters();
});

reportType.addEventListener("change", applyReportFilters);

reportLearner.addEventListener("change", applyReportFilters);



// AUTHENTICATION


onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (!currentUser) {
        learners = [];
        tasks = [];
        bookings = [];
        games = [];

        reportsMessage.textContent =
            "Please sign in to view reports.";

        showReportsBtn.disabled = true;
        downloadCurrentReport.disabled = true;

        return;
    }

    showReportsBtn.disabled = false;
    downloadCurrentReport.disabled = false;

    try {
        await loadAllReportsData();
    } catch (error) {
        console.error("Error loading reports:", error);

        reportsMessage.textContent =
            "Could not load report data..";
    }
});

