
<div align="center">
  <h2> TriChat - Chat Application </h2>
</div>

### Introduction
This project is developed as part of the Data Structures and Algorithms (DSA) course, CSC200L, under the instructions of Sir Nazeef Ul Haq. It is designed to simulate core messaging features. It allows users to engage in one-on-one chats, group conversations, and more, with all data managed in memory instead of a database. The goal is to demonstrate how data structures and algorithms can be used to build efficient, scalable, and interactive web applications.

### Description of the Project
This project, TriChat, is a lightweight, web-based messaging application designed to provide an interactive chat experience. It is developed using HTML, CSS, and JavaScript, incorporating Object-Oriented Programming (OOP) principles and efficient data structures to ensure a smooth and responsive user experience. The codebase is well-organized, leveraging classes to manage different components of the application.

The chat system uses a graph-based structure to represent user connections, where each user is a node, and edges denote relationships like one-on-one chats or group memberships. Messages are managed using queues to ensure proper ordering and delivery. Groups are stored using hash tables for quick access. A tree-based structure organizes conversations, treating replies as child nodes of the original message. Priority queues are utilized to prioritize important or recent messages, making communication seamless.

Key features of TriChat include messaging for both individual and group chats, user presence indicators (online/offline status), and a searchable contacts. The application also supports group management, allowing users to create and leave groups. All data, including user profiles, chat history, and group settings, are stored in the browser’s local storage, simulating database functionality.

The user interface is designed with HTML and CSS to ensure responsiveness. JavaScript powers the interactivity, dynamically updating the interface based on user actions like sending messages or switching chats. This project highlights how advanced data structures and algorithms can be used to build efficient, scalable, and feature-rich web applications.
### Instructions to Run the Program
- Clone the repo from the provided link using this command\
  `git clone https://gitlab.com/Saroosh05/chat-application.git `
- Open the folder "chat-application"
- Double-click the file login.html

### Dependencies
No packages and system dependant paths are used. To run the program, the only thing needed is the web browser.

### Documnetation
The report of this project exists in this repo.


