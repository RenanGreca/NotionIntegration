import { Client } from "@notionhq/client"
import { TodoistApi } from "@doist/todoist-api-typescript"

// Initialize Notion Client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})
// Initialize Todoist Client
const todoist = new TodoistApi(process.env.TODOIST_TOKEN)

const projectsDatabaseID = "83a48c47d2884fed8a92551ab831d24c"

const projects = await notion.databases.query({
    database_id: projectsDatabaseID,
    filter: {
      property: "TodoistID",
      number: {
        is_not_empty: true,
      },
    },
})


projects.results.forEach(element => {
    let pageID = element.id;
    let projectID = element.properties.TodoistID.number;

    todoist.getTasks({"project_id": String(projectID)})
        .then(function(tasks) {
            let completed = getProportionCompleted(tasks);
            // console.log(completed);
            updatePage(pageID, completed)
        })
        .catch((error) => console.log(error))

});


function getProportionCompleted(tasks) {
    let numTasks = tasks.length;
    let numCompleted = tasks.reduce(function(result, element) {
        // console.log(element);
        if (element.isCompleted) {
            result += 1;
        }
    }, 0);

    return numTasks;
}

async function updatePage(pageID, number) {
    const response = await notion.pages.update({
        page_id: pageID,
        properties: {
            "Tasks": {
                "number": number
            }
        }
    });
    // console.log(response);
}