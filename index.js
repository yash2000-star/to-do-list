const express = require('express');
const bodyParser = require('body-parser'); // You can also use express.json() for other types of requests
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.use(express.static('public')); // Serve static files from 'public' directory

// In-memory array to store tasks
let tasks = [];
let nextTaskId = 1; // Simple counter for unique IDs

// Function to find the next available ID if tasks array is populated
// This ensures IDs are somewhat unique even after deletions if server restarts
// and tasks were pre-populated (though for in-memory they reset on restart).
const getNextId = () => {
    if (tasks.length > 0) {
        // Find the maximum current ID and add 1
        return Math.max(...tasks.map(task => task.id)) + 1;
    }
    return 1; // Start from 1 if no tasks
};
nextTaskId = getNextId();


// Route to display all tasks
app.get("/", (req, res) => {
     const currentFilter = req.query.filter || "all";
      let filteredTasks = tasks;

        if (currentFilter !== "all") {
        filteredTasks = tasks.filter(task => task.priority === currentFilter);
    }
     res.render("list", { 
        ejes: filteredTasks,
        currentFilter: currentFilter
    });
});

// Route to add a new task
app.post("/", (req, res) => {
    const itemName = req.body.elel; 
    const itemPriority = req.body.priority || "Medium";

    if (itemName && itemName.trim() !== "") {
        const newTask = {
            id: nextTaskId,
            name: itemName.trim(),
            priority: itemPriority
        };
        tasks.push(newTask);
        nextTaskId = getNextId(); // Update nextTaskId for the next potential task
        console.log("Added new task:", newTask);
    } else {
        console.log("Attempted to add an empty task.");
        // Later, we can pass an error message back to the EJS template
    }
    res.redirect("/"); // Redirect back to the main page to see the updated list
});

// Route to delete a task
app.post("/delete", (req, res) => {
    // The value from the checkbox is the ID of the task to delete
    // Ensure it's treated as a number if your IDs are numbers
    const taskIdToDelete = parseInt(req.body.checkbox1); 

    if (!isNaN(taskIdToDelete)) {
        const initialLength = tasks.length;
        tasks = tasks.filter(task => task.id !== taskIdToDelete);
        
        if (tasks.length < initialLength) {
            console.log(`Deleted task with ID: ${taskIdToDelete}`);
        } else {
            console.log(`Task with ID: ${taskIdToDelete} not found for deletion.`);
        }
    } else {
        console.log("Invalid task ID for deletion.");
    }
    res.redirect("/");
});

app.get("/edit/:taskId", (req, res) => {
    const taskIdToEdit = parseInt(req.params.taskId);
    const taskToEdit = tasks.find(task => task.id === taskIdToEdit);

    if (taskToEdit) {
        res.render("edit", { taskToEdit: taskToEdit });
    } else {
        // Optionally handle task not found, e.g., render an error page or redirect
        console.log(`Edit: Task with ID ${taskIdToEdit} not found.`);
        res.redirect("/"); // Or res.status(404).send("Task not found");
    }
});

// POST route to update a task
app.post("/edit/:taskId", (req, res) => {
    const taskIdToUpdate = parseInt(req.params.taskId);
    const updatedTaskName = req.body.updatedTaskName; // Name from the input field in edit.ejs
     const updatedTaskPriority = req.body.updatedTaskPriority;

    if (updatedTaskName && updatedTaskName.trim() !== "") {
        const taskIndex = tasks.findIndex(task => task.id === taskIdToUpdate);
        if (taskIndex !== -1) {
            tasks[taskIndex].name = updatedTaskName.trim();
            tasks[taskIndex].priority = updatedTaskPriority;
            console.log(`Updated task ID ${taskIdToUpdate} to name "${tasks[taskIndex].name}" and priority "${tasks[taskIndex].priority}"`);
        } else {
            console.log(`Update: Task with ID ${taskIdToUpdate} not found.`);
        }
    } else {
        console.log("Attempted to update task with an empty name.");
    }
    res.redirect("/");
});



app.listen(3000, function() {
    console.log("Server is running on port 3000");
    // Initialize nextTaskId based on any pre-existing tasks if you add them directly to the array
    nextTaskId = getNextId();
});