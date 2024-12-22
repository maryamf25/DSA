let users = [];
let messageList = [];
let currentUser = null;

// Loading stored users from localStorage when the page loads
function initializeUsers() {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    for (let i = 0; i < storedUsers.length; i++) {
        Object.setPrototypeOf(storedUsers[i], User.prototype);

        if (storedUsers[i].contacts) {
            Object.setPrototypeOf(storedUsers[i].contacts, Queue.prototype);
        }
        if (storedUsers[i].messages) {
            Object.setPrototypeOf(storedUsers[i].messages, Queue.prototype);
        }
        if (storedUsers[i].groups) {
            Object.setPrototypeOf(storedUsers[i].groups, HashTable.prototype);
        }
        if (storedUsers[i].requests) {
            Object.setPrototypeOf(storedUsers[i].requests, Queue.prototype);
        }
        users.push(storedUsers[i]);
    }
    console.log("Users loaded from localStorage:", users);
    console.log(users.length);
}

function initializeCurrentUser() {
    const storedCurrentUser = localStorage.getItem('currentUser');
    if (storedCurrentUser) {
        let parsed = JSON.parse(storedCurrentUser);
        currentUser = Object.setPrototypeOf(parsed, User.prototype);
        Object.setPrototypeOf(currentUser.contacts, Queue.prototype);
        Object.setPrototypeOf(currentUser.messages, PriorityQueue.prototype);
        Object.setPrototypeOf(currentUser.groups, HashTable.prototype);
        if(currentUser.requests)
        {
            Object.setPrototypeOf(currentUser.requests, Queue.prototype);
        }
        console.log('Current user loaded from localStorage:', currentUser);
    } else {
        console.log('No current user found in localStorage');
    }

    currentUser = FindUser(currentUser.phoneNumber);
}

function initializeMessages() {
    const storedMsgs = JSON.parse(localStorage.getItem('messages')) || [];

    for (let i = 0; i < storedMsgs.length; i++) {
        // Setting the prototype of the message object
        Object.setPrototypeOf(storedMsgs[i], Message.prototype);

        // Finding the sender and receiver using their phone numbers
        const sender = FindUser(storedMsgs[i].sender);
        const receiver = FindUser(storedMsgs[i].receiver);

        if (sender && receiver) {
            // Setting the properties directly on the message object
            const msg = storedMsgs[i];
            msg.sender = sender;
            msg.receiver = receiver;
            messageList.push(msg);
        }
    }

    console.log("Messages loaded from localStorage:", messageList);
}

// Saving users to localStorage
function saveUsersToStorage() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Function to add a new user to the array
function addNewUser(user) {
   users.push(user);
   saveUsersToStorage();
}

// Function to toggle between login and signup forms
function toggleForm() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
}

function login() {
    const username = document.getElementById('login-username').value;
    const phone = document.getElementById('login-phone').value;
  
    if (username && phone) {
        console.log(username, phone);

        const user = users.find(u => u && u.username === username && u.phoneNumber === phone);
        if (user) {
            currentUser = FindUser(user.phoneNumber);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            alert('Login successful!');
            FindUser(phone).updateOnlineStatus(true);

            window.location.href = 'index.html';
        } else {
            alert('User not found or incorrect credentials.');
        }
    } else {
        alert('Please fill in all fields.');
    }
    let curr = currentUser.messages.peek();
    while(curr)
    {
        console.log('msgs queue',curr.data);
        curr = curr.next;
    }
}

function signup() {
    
    const username = document.getElementById('signup-username').value;
    const phone = document.getElementById('signup-phone').value;

    if (!/^\d{11}$/.test(phone)) {
        alert('Phone number must contain exactly 11 digits.');
        return;
    }

    const user = users.find(u => u.phoneNumber === phone);
    if(user) {
        alert('Phone number already exists.');
        return;
    }
    createUser(username, phone);
    
}

// Function to create the user and update profile picture
function createUser(username, phone) {
    const newUser = new User(username, phone);
    addNewUser(newUser);

    console.log('New user created:', newUser);
    alert('Sign up successful!');

    toggleForm();
}

function renderRequests() {
    const grpDiv = document.getElementById("graph");
    const i = document.getElementById("ch");
    const p = document.getElementById("msg");

    grpDiv.classList.add("hidden");
    i.style.display = 'block';
    p.style.display = 'block';

    console.log(currentUser.getRequests());
    const title = document.getElementById("title");
    title.textContent = "Requests";
    const requestList = document.getElementById('user-list');
    requestList.innerHTML = "";
    let requests = currentUser.getRequests();
    let current  = null;
    if(requests)
    {
        current = requests.peek();
    }
    while (current) {
        console.log(currentUser.getRequests().peek().data);
        const listItem = document.createElement('li');

        if(current.data) {
            let user = FindUser(current.data);
            //console.log('contact ', user);
            listItem.innerHTML = `
                <a href="#" data-conversation="#conversation-template" data-phone-number="${user.phoneNumber}">
                    <div class="content-message-image" style="background-color: var(--slate-100); border: 2px solid var(--emerald-600); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px; color: var(--emerald-600); font-weight: bold; text-transform: uppercase;">
                        ${user.username.charAt(0).toUpperCase()}
                    </div>
                    <span class="content-message-info">
                        <span class="content-message-name">${user.username}</span>
                        <span class="content-message-text">${user.phoneNumber}</span>
                    </span>
                </a>
            `;
        }
        else {

        }
        requestList.appendChild(listItem);
        current = current.next;
    }

    displayOptionToAddContact();
}

function displayOptionToAddContact() {
    // Adding event listeners to open the corresponding conversation
    document.querySelectorAll('[data-conversation]').forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('clicked');

            let user = null;
            let group = null;
            let phone = null;
            let groupId = null;
            console.log("dataset", this.dataset);
            if (this.dataset.phoneNumber) {
                phone = this.dataset.phoneNumber;
                user = FindUser(phone);

                if (!user) {
                    console.error("User not found:");
                }

                replaceConversationWithButton(phone);
            }
            else {
            }


        });
    });
}

function placePhoneNumber(phone) {
    const phoneInput = document.getElementById("contact-phone");
    phoneInput.value = phone;
}

function retrieveCookie (name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function replaceConversationWithButton(phone) {
    const conversationDiv = document.getElementById("conversation");
    conversationDiv.innerHTML = "";
    const button = document.createElement("button");
    button.textContent = "Add this contact";
    button.style.padding = "12px 24px";
    button.style.fontSize = "16px";
    button.style.fontWeight = "bold";
    button.style.color = "#ffffff";
    button.style.backgroundColor = "var(--emerald-600)";
    button.style.border = "none";
    button.style.borderRadius = "8px";
    button.style.cursor = "pointer";
    button.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    button.style.transition = "transform 0.2s, background-color 0.2s";

    button.onmouseover = () => {
        button.style.backgroundColor = "var(--emerald-500)";
        button.style.transform = "scale(1.05)";
    };
    button.onmouseout = () => {
        button.style.backgroundColor = "var(--emerald-600)";
        button.style.transform = "scale(1)";
    };

    button.addEventListener("click", function(e) {
        e.preventDefault();
        document.cookie =`phoneNumber=${phone};`;
        window.location.href = "contact-form.html";
    })


    // Center the button inside the div
    conversationDiv.style.display = "flex";
    conversationDiv.style.justifyContent = "center";
    conversationDiv.style.alignItems = "center";
    conversationDiv.style.height = "100%";
    conversationDiv.style.backgroundColor = "#f0f0f0";


    conversationDiv.appendChild(button);
}
// Function to render users into the sidebar
function renderUsers(graph = true) {
    // console.log(currentUser);
    // console.log(currentUser.getGroups());

    if (graph) {
        const grpDiv = document.getElementById("graph");
        const i = document.getElementById("ch");
        const p = document.getElementById("msg");

        grpDiv.classList.add("hidden");
        i.style.display = 'block';
        p.style.display = 'block';
    }
    const title = document.getElementById("title");
    title.textContent = "Contacts";

    const userList = document.getElementById('user-list');
    userList.innerHTML = "";
    console.log('render users called');
    console.log('total contacts: ',FindUser(currentUser.phoneNumber).getContacts().size);
    let current = currentUser.getContacts().peek();
    let lastMessage = null;
    while (current) {
        console.log('upper if ',current.data.username);
        const listItem = document.createElement('li');

        if(current.data.username) {
            let user = FindUser(current.data.phoneNumber);
             lastMessage = getLastMessageWithSpecificUser(current.data);
            //console.log('contact ', user);
            listItem.innerHTML = `
                <a href="#" data-conversation="#conversation-template" data-phone-number="${user.phoneNumber}">
                    <div class="content-message-image" style="background-color: var(--slate-100); border: 2px solid var(--emerald-600); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px; color: var(--emerald-600); font-weight: bold; text-transform: uppercase;">
                        ${user.nickname.charAt(0).toUpperCase()}
                    </div>
                    <span class="content-message-info">
                        <span class="content-message-name">${user.nickname}</span>
                        <span class="content-message-text">${user.phoneNumber}</span>
                    </span>
                    
                </a>
            `;
            userList.appendChild(listItem);
        }
        else {
            
            console.log("id", current.data.grpID);
            let group = currentUser.getGroups().getGroup(current.data.grpID);
            lastMessage = getRecentGroupMessage(group);
            //console.log(currentUser.getGroups());
            //console.log('contact ', user);
            if (group) {
                listItem.innerHTML = `
                <a href="#" data-conversation="#conversation-template" data-group-id="${group.grpID}">
                    <img src="images/noGrpPfp.png" alt="Group Pic" class="content-message-image" style="background-color: var(--slate-100); border: 2px solid var(--emerald-600); border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                    <span class="content-message-info">
                        <span class="content-message-name">${group.groupName}</span>
                        <span class="content-message-text">Tap to chat</span>
                    </span>
                    
                </a>
            `;
                userList.appendChild(listItem);
            }

        }
        current = current.next;
    }

    // Adding event listeners to open the corresponding conversation
    document.querySelectorAll('[data-conversation]').forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('clicked');

            const groupTopDiv = document.getElementById('conversationTop');
            const groupMainDiv = document.getElementById('conversationMain');
            const groupFormDiv = document.getElementById('conversationForm');
            groupTopDiv.style.display = 'flex';
            groupMainDiv.style.display = 'block';
            groupFormDiv.style.display = 'flex';

            const groupHeaderDiv = document.getElementById('headerGrp');
            const groupContentDiv = document.getElementById('grpContainer');
            groupHeaderDiv.style.display = 'none';
            groupContentDiv.style.display = 'none';

            let user = null;
            let group = null;
            let phone = null;
            let groupId = null;
            console.log(this.dataset);
            if (this.dataset.phoneNumber) {
                initializeMessages();
                phone = this.dataset.phoneNumber;
                user = FindUser(phone);
                document.body.setAttribute('data-current-receiver', phone);
                if (!user) {
                    console.error("User not found:");
                    return;
                }
                loadMessages(phone, null);
                markMessageAsSeen(user);
                renderUsers();
                console.log('slecetd user ',user.phoneNumber);
                // console.log('ou msgs ',user.messages);
            }
            else {
                groupId = this.dataset.groupId;
                document.body.setAttribute('data-current-group-id', groupId);
                console.log(currentUser.getGroups())
                group = currentUser.getGroups().getGroup(groupId);
                if (!group) {
                    console.error("Group not found:");
                    return;
                }

                loadMessages(null, group);
                markGroupMessagesAsSeen(group);
                console.log('seen: ', group);
                renderUsers();
            }

            // Getting the conversation container template
            const conversationTemplate = document.getElementById('conversation-template');

            // Removing 'active' class from all conversations
            const allConversations = document.querySelectorAll('.conversation');
            allConversations.forEach(convo => convo.classList.remove('active'));

            // Adding 'active' class to the conversation template
            conversationTemplate.classList.add('active');
            // Populating the conversation container with the user's data


            if (user) {
                document.getElementById('contactPfp').style.display = 'flex';
                const text = document.getElementById('contactPfp');
                text.textContent = user.nickname.charAt(0).toUpperCase();
                document.getElementById('conversation-user-name').textContent = user.nickname;
                document.getElementById('conversation-user-status').textContent = user.isOnline ? "online": "offline";
                document.getElementById('conversation-user-image').style.display = 'none';
                conversationTemplate.dataset.phoneNumber = phone;
            }
            else {
                document.getElementById('conversation-user-name').textContent = group.groupName;
                document.getElementById('conversation-user-status').style.display = 'none';
                document.getElementById('conversation-user-image').style.display = 'block';
                document.getElementById('contactPfp').style.display = 'none';
                conversationTemplate.dataset.grpID = groupId;

                const grpHeader = document.getElementById('conversationTop');
                grpHeader.addEventListener('click', function(e) {
                    showGroupDescription(group);
                })
            }
        });
    });
}
function renderChats() {
    const grpDiv = document.getElementById("graph");
    const i = document.getElementById("ch");
    const p = document.getElementById("msg");

    grpDiv.classList.add("hidden");
    i.style.display = 'block';
    p.style.display = 'block';

    console.log(currentUser);
    console.log(currentUser.getGroups());

    const title = document.getElementById("title");
    title.textContent = "Chats";

    const userList = document.getElementById('user-list');
    userList.innerHTML = "";
    console.log('render chats called');
    console.log('total contacts: ',FindUser(currentUser.phoneNumber).getContacts().size);
    let current = currentUser.getContacts().peek();
    let lastMessage = null;
    while (current) {
        console.log(current.data.username);
        const listItem = document.createElement('li');

        if(current.data.username) {
            let user = FindUser(current.data.phoneNumber);
             lastMessage = getLastMessageWithSpecificUser(current.data);
            //console.log('contact ', user);
            if(lastMessage)
            {
                listItem.innerHTML = `
                <a href="#" data-conversation="#conversation-template" data-phone-number="${user.phoneNumber}">
                    <div class="content-message-image" style="background-color: var(--slate-100); border: 2px solid var(--emerald-600); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px; color: var(--emerald-600); font-weight: bold; text-transform: uppercase;">
                        ${user.nickname.charAt(0).toUpperCase()}
                    </div>
                    <span class="content-message-info">
                        <span class="content-message-name">${user.nickname}</span>
                        <span class="content-message-text">${lastMessage ? lastMessage.text : 'Tap to chat'}</span>
                    </span>
                    <span class="content-message-more">
                        ${countUnreadMessages(user) > 0 ? `<span class="content-message-unread">${countUnreadMessages(user)}</span>` : ''}
                        <span class="content-message-time">${lastMessage ? getFormattedTimeString(lastMessage.time): ''}</span>
                    </span>
                </a>
            `;
            userList.appendChild(listItem);
            }
        }
        else {
            
            //console.log("id", current.data.grpID);
            let group = currentUser.getGroups().getGroup(current.data.grpID);
            lastMessage = getRecentGroupMessage(group);
            let sender = '';
            let senderName = '';
            if(lastMessage)
            {
                sender = FindUser(lastMessage.sender);
            senderName = sender.nickname;
            if(!senderName)
                {
                    senderName = FindUser(lastMessage.sender).username;
                }
            }
            
            
            console.log(sender);
            if(lastMessage)
            {
                if (group) {
                    listItem.innerHTML = `
                    <a href="#" data-conversation="#conversation-template" data-group-id="${group.grpID}">
                        <img src="images/noGrpPfp.png" alt="Group Pic" class="content-message-image" style="background-color: var(--slate-100); border: 2px solid var(--emerald-600); border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                        <span class="content-message-info">
                            <span class="content-message-name">${group.groupName}</span>
                            <span class="content-message-text">${sender ? senderName +  ': ' + lastMessage.text : 'Tap to chat'}</span>
                        </span>
                        <span class="content-message-more">
                            ${countGroupUnreadMessages(group) > 0 ? `<span class="content-message-unread">${countGroupUnreadMessages(group)}</span>` : ''}
                            <span class="content-message-time">${lastMessage ? getFormattedTimeString(lastMessage.time): ''}</span>
                        </span>
                    </a>
                `;
                    userList.appendChild(listItem);
                }
            }
            //console.log(currentUser.getGroups());
            //console.log('contact ', user);
            

        }
        current = current.next;
    }

    openConversation();
}

function openConversation () {
    // Adding event listeners to open the corresponding conversation
    document.querySelectorAll('[data-conversation]').forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('clickedchattttttttttt');

            const groupTopDiv = document.getElementById('conversationTop');
            const groupMainDiv = document.getElementById('conversationMain');
            const groupFormDiv = document.getElementById('conversationForm');
            groupTopDiv.style.display = 'flex';
            groupMainDiv.style.display = 'block';
            groupFormDiv.style.display = 'flex';

            const groupHeaderDiv = document.getElementById('headerGrp');
            const groupContentDiv = document.getElementById('grpContainer');
            groupHeaderDiv.style.display = 'none';
            groupContentDiv.style.display = 'none';

            let user = null;
            let group = null;
            let phone = null;
            let groupId = null;
            
            document.body.setAttribute('data-current-receiver', null);
            if (this.dataset.phoneNumber) {
                document.body.setAttribute('data-current-receiver', this.dataset.phoneNumber);
                console.log('savedphone ',  document.body.getAttribute('data-current-receiver'))

                initializeMessages();
                phone = this.dataset.phoneNumber;
                user = FindUser(phone);

                if (!user) {
                    console.error("User not found:");
                    return;
                }
                loadMessages(phone, null);
                markMessageAsSeen(user);
                renderChats();
                // console.log('cu msgs ',currentUser.messages);
                // console.log('ou msgs ',user.messages);
            }
            else {
                groupId = this.dataset.groupId;
                document.body.setAttribute('data-current-group-id', groupId);
                console.log(currentUser.getGroups())
                group = currentUser.getGroups().getGroup(groupId);
                if (!group) {
                    console.error("Group not found:");
                    return;
                }

                loadMessages(null, group);
                markGroupMessagesAsSeen(group);
                console.log('seen: ', group);
                renderChats();
            }

            // Getting the conversation container template
            const conversationTemplate = document.getElementById('conversation-template');

            // Removing 'active' class from all conversations
            const allConversations = document.querySelectorAll('.conversation');
            allConversations.forEach(convo => convo.classList.remove('active'));

            // Adding 'active' class to the conversation template
            conversationTemplate.classList.add('active');
            // Populating the conversation container with the user's data


            if (user) {
                document.getElementById('contactPfp').style.display = 'flex';
                const text = document.getElementById('contactPfp');
                text.textContent = user.nickname.charAt(0).toUpperCase();
                document.getElementById('conversation-user-name').textContent = user.nickname;
                document.getElementById('conversation-user-status').textContent = user.isOnline ? "online": "offline";
                document.getElementById('conversation-user-image').style.display = 'none';
                conversationTemplate.dataset.phoneNumber = phone;
            }
            else {
                document.getElementById('conversation-user-name').textContent = group.groupName;
                document.getElementById('conversation-user-status').style.display = 'none';
                document.getElementById('conversation-user-image').style.display = 'block';
                document.getElementById('contactPfp').style.display = 'none';
                conversationTemplate.dataset.grpID = groupId;

                const grpHeader = document.getElementById('conversationTop');
                grpHeader.addEventListener('click', function(e) {
                    showGroupDescription(group);
                })
            }
        });
    });
}
function findMessageById(id, groupObject) {
    let currentNode = null;
    let messageTree = null;
    if(groupObject && id)
    {
            currentNode = groupObject.messages.front;
    }
    else if(id)
    {
        currentNode = currentUser.messages.front;
    }
    
    console.log('curr node: ', currentNode);
    while (currentNode) {
        messageTree = currentNode.data;
        console.log(messageTree.root.id, ' == ', id);
        if (messageTree.root.id == id) {
            return messageTree;
        }
        currentNode = currentNode.next;
    }
    return null;
}
function findMessageByIdForReceiver(id, user, groupObject) {
    let currentNode = null;
    let messageTree = null;
    if(user)
    {
        currentNode = user.messages.front;
    }
    else if(groupObject)
    {
        currentNode = groupObject.messages.front;
    }
    while (currentNode) {
        messageTree = currentNode.data;
        if (messageTree.root.id == id) {
            return messageTree;
        }
        currentNode = currentNode.next;
    }
    return null;
}
        
function loadMessages(phoneNumber, groupObject)
{
    const conversation = document.getElementById('conversation-messages');
    conversation.innerHTML = '';
    let currentNode = null;
    let message = null;
    let parentMessage= null;
    console.log("group current converstaion: ", groupObject);
    if(groupObject)
    {
        
        Object.setPrototypeOf(groupObject, Group.prototype);
        if(groupObject.messages)
        {
            Object.setPrototypeOf(groupObject.messages, PriorityQueue.prototype);
            currentNode = groupObject.messages.peek();
            console.log("group current mess: ", groupObject.messages);
            while (currentNode) {
                message = currentNode.data.root;
                    parentMessage = isReplyToAMessage(message, groupObject);
                    console.log('P: ');
                    const listItem = document.createElement('div');
        
                    if (currentNode.data.root.sender == currentUser.phoneNumber) 
                    {
                        listItem.innerHTML = getSenderMessageTemplate(message, parentMessage) ;
                        console.log('ur sender for: ', message.text);
                    }
                    else {
                        listItem.innerHTML = getReceiverMessageTemplate(message, parentMessage, message.sender);
                    }
        
                    conversation.appendChild(listItem);
                currentNode = currentNode.next;
            }
        }
        
        
    }
    else if(phoneNumber)
    {
        currentNode = currentUser.messages.peek();
        while (currentNode) {
            if (currentNode.data.root.sender === phoneNumber || currentNode.data.root.receiver === phoneNumber) {
                //console.log('CMT: ', currentNode.data.children);
                message = currentNode.data.root;
                parentMessage = isReplyToAMessage(message, null);
                //console.log('P: ', parentMessage, 'M: ', message);
                const listItem = document.createElement('div');
    
                if (currentNode.data.root.receiver === phoneNumber) 
                {
                    listItem.innerHTML = getSenderMessageTemplate(message, parentMessage) ;
                }
                else {
                    listItem.innerHTML = getReceiverMessageTemplate(message, parentMessage, phoneNumber);
                }
    
                conversation.appendChild(listItem);
            }
    
            currentNode = currentNode.next;
        }
    }
    
    
    
    initializeDropdown();

    const replyButtons = document.querySelectorAll('.reply-button');
    replyButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            let converstionItem = this.closest('.conversation-item');
            if(!converstionItem)
            {
                converstionItem = this.closest('.conversation-item-me');

            }
            console.log(converstionItem);
            if(converstionItem)
            {
                let messageId = converstionItem.getAttribute('data-message-id');
                console.log('got messageId', messageId);
                //document.getElementById('message-text').value = ` < Reply to "${findMessageById(messageId).root.text}" > \n`;
                document.querySelector('.reply-button').setAttribute('data-saved-message-id', messageId);
                if(phoneNumber)
                {
                    console.log('Replying to:', findMessageById(messageId));
                }
                else if(groupObject)
                {
                    console.log('Replying in group:', groupObject);
                    console.log('Replying to:', findMessageById(messageId, groupObject));
                }
            }

        });
    });

}
function getSenderMessageTemplate(message, parentMessage)
{
    if(parentMessage)
    {
        return ` 
                <li class="conversation-item" data-message-id="${message.id}">
                    <div class="conversation-item-side">
                    <div class="conversation-item-image" style="background-color: var(--slate-100); border: 2px solid var(--emerald-600); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px; color: var(--emerald-600); font-weight: bold; text-transform: uppercase;">
                        ${currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    </div>
                    <div class="conversation-item-content">
                        <div class="conversation-item-wrapper">
                            <div class="conversation-item-box">
                                <div class="conversation-item-text">
                                    <p>Reply To ${parentMessage.root.text} <br> ${message.text}</p>
                                    <div class="conversation-item-time">${message.time}</div>
                                </div>
                                    <div class="conversation-item-dropdown">
                                        <button type="button" class="conversation-item-dropdown-toggle" ><i class="ri-more-2-fill"></i></button>
                                        <ul class="conversation-item-dropdown-list">
                                            <li><a href="#" class= "reply-button"><i class="ri-reply-fill"></i></a></li>
                                        </ul>
                                    </div>
                            </div>
                        </div>
                    </div>
                </li>
            `;
    }
    else
    {
        return ` 
                <li class="conversation-item" data-message-id="${message.id}">
                    <div class="conversation-item-side">
                    <div class="conversation-item-image" style="background-color: var(--slate-100); border: 2px solid var(--emerald-600); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px; color: var(--emerald-600); font-weight: bold; text-transform: uppercase;">
                        ${currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    </div>
                    <div class="conversation-item-content">
                        <div class="conversation-item-wrapper">
                            <div class="conversation-item-box">
                                <div class="conversation-item-text">
                                    <p>${message.text}</p>
                                    <div class="conversation-item-time">${message.time}</div>
                                </div>
                                    <div class="conversation-item-dropdown">
                                        <button type="button" class="conversation-item-dropdown-toggle" ><i class="ri-more-2-fill"></i></button>
                                        <ul class="conversation-item-dropdown-list">
                                            <li><a href="#" class= "reply-button"><i class="ri-reply-fill"></i></a></li>
                                        </ul>
                                    </div>
                            </div>
                        </div>
                    </div>
                </li>
            `;
    }
    
}
function getReceiverMessageTemplate(message, parentMessage, phoneNumber)
{
    if(parentMessage)
        {
            return ` 
            <li class="conversation-item-me" data-message-id="${message.id}">
                <div class="conversation-item-side">
                    <div class="conversation-item-image" style="background-color: var(--slate-100); border: 2px solid var(--emerald-600); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px; color: var(--emerald-600); font-weight: bold; text-transform: uppercase;">
                        ${FindUser(phoneNumber).username.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div class="conversation-item-content">
                    <div class="conversation-item-wrapper">
                        <div class="conversation-item-box">
                            <div class="conversation-item-text">
                                <p>Reply To ${parentMessage.root.text} <br> ${message.text}</p>
                                <div class="conversation-item-time">${message.time}</div>
                            </div>
                                <div class="conversation-item-dropdown">
                                    <button type="button" class="conversation-item-dropdown-toggle" ><i class="ri-more-2-fill"></i></button>
                                    <ul class="conversation-item-dropdown-list">
                                        <li><a href="#" class= "reply-button"><i class="ri-reply-fill"></i></a></li>
                                    </ul>
                                </div>
                        </div>
                    </div>
                </div>
            </li>
        `;
        }
        else
        {
            return  ` 
            <li class="conversation-item-me" data-message-id="${message.id}">
                <div class="conversation-item-side">
                    <div class="conversation-item-image" style="background-color: var(--slate-100); border: 2px solid var(--emerald-600); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px; color: var(--emerald-600); font-weight: bold; text-transform: uppercase;">
                        ${FindUser(phoneNumber).username.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div class="conversation-item-content">
                    <div class="conversation-item-wrapper">
                        <div class="conversation-item-box">
                            <div class="conversation-item-text">
                                <p>${message.text}</p>
                                <div class="conversation-item-time">${message.time}</div>
                            </div>
                                <div class="conversation-item-dropdown">
                                    <button type="button" class="conversation-item-dropdown-toggle" ><i class="ri-more-2-fill"></i></button>
                                    <ul class="conversation-item-dropdown-list">
                                        <li><a href="#" class= "reply-button"><i class="ri-reply-fill"></i></a></li>
                                    </ul>
                                </div>
                        </div>
                    </div>
                </div>
            </li>
        `;
        }
    
}
function sendMessage()
{
    //const conversation = document.getElementById('conversation-messages');
    const text = document.getElementById('message-text').value;
    let newMsg = null;
    let group = null;
    let receivers = [];
    // const time = new Date().toLocaleString();
    // const listItem = document.createElement('div');
    const receiverPhone = document.body.getAttribute('data-current-receiver');
    if(receiverPhone)
    {
        Object.setPrototypeOf(receiverPhone, String.prototype);
    }
    console.log("Current Receiver:", receiverPhone);
    console.log("Current Receiver:", typeof receiverPhone);
    if(receiverPhone !="null" && receiverPhone != null)
    {
        console.log('first if');
        receivers.push(receiverPhone);
        receivers.push(currentUser.phoneNumber);
        console.log(receivers);
        newMsg = new Message(text, currentUser.phoneNumber, receiverPhone);
        
        // messageList.push(newMsg);
        // console.log('New Message',newMsg);
        let msgTree = new TreeNode(newMsg);
        
        currentUser.addMsg(msgTree);
        FindUser(receiverPhone).addMsg(msgTree);
        // console.log('Current user msgs: ', currentUser.messages);
        // console.log('Receier msgs: ', FindUser(receiverPhone).messages);
        
    }
    else
    {
        const groupId = document.body.getAttribute('data-current-group-id');
        group = currentUser.getGroups().getGroup(groupId);
        console.log("Current Group:", group);
        document.body.setAttribute('data-current-group-id', null);
        if(group)
        {
            
            receivers = getGroupMembersPhoneNumber(group);
            newMsg = new Message(text, currentUser.phoneNumber, null);
            let msgTree = new TreeNode(newMsg);

            for(let i=0; i < receivers.length; i++)
            {
                let user = FindUser(receivers[i]);
                group = user.getGroups().getGroup(groupId);
                Object.setPrototypeOf(group, Group.prototype);
                if(group.messages)
                {
                    Object.setPrototypeOf(group.messages, PriorityQueue.prototype);
                }

                console.log(group === user.getGroups().getGroup(groupId));
                group.addMsg(msgTree);
                
            }
            
            if(newMsg)
            {
                addMessageReply(newMsg, receivers, null, group);
            }
            //console.log("Current Ggggroup:", group);
            loadMessages(null, group);
            console.log("Cloafed:", group.messages.size);
        }
        
    }
    
    saveUsersToStorage();
    initializeDropdown();
    if(receiverPhone !="null" && receiverPhone !=null)
    {
        if(newMsg)
        {
            addMessageReply(newMsg, receivers, receiverPhone, null);
        }
        loadMessages(receiverPhone, null);
    }
    document.getElementById('message-text').value='';
    document.body.setAttribute('data-current-receiver', null);
    
}
function getGroupMembersPhoneNumber(groupObject)
{
    let receivers = [];
    for(let i=0; i < groupObject.members.length; i++)
    {
        receivers.push(groupObject.members[i]);
    }
    return receivers;
}
function addMessageReply(newMsg, receivers, person, group)
{
    let replybutton = document.querySelector('.reply-button');
    let parentMessageId = null;
    if(replybutton)
    {
        parentMessageId = replybutton.getAttribute('data-saved-message-id');
        document.querySelector('.reply-button').setAttribute('data-saved-message-id', null);
    }
        console.log('Saved Message ID:',  parentMessageId);
    if(parentMessageId)
    {
        for(let i=0; i < receivers.length; i++)
        {
            console.log("looop:", receivers);
            let origialMessageForReceiver = null;
            if(person)
            {
                origialMessageForReceiver = findMessageByIdForReceiver(parentMessageId, FindUser(receivers[i]), null);
            }
            else if(group)
            {
                origialMessageForReceiver = findMessageByIdForReceiver(parentMessageId, null, group);
            }
            Object.setPrototypeOf(origialMessageForReceiver, TreeNode.prototype);
            if(origialMessageForReceiver)
            {
                origialMessageForReceiver.addChild(newMsg);
            }
            else 
            {
                console.log("Message ID not found.");
                return;
            }
            console.log('Replyd to:', origialMessageForReceiver);
        }
    }
}

function isReplyToAMessage(message, groupObject)
{
    let currentNode = null;
    let messageTree = null;
    let isReply = false;
    if(message && groupObject)
    {
        currentNode  = groupObject.messages.front;
    }
    else if(message)
    {
        currentNode  = currentUser.messages.front;

    }
    while(currentNode)
    {
        messageTree = currentNode.data;

        for(let i = 0; i < messageTree.children.length; i++)
        {
            if(messageTree.children[i].id ==  message.id)
            {
                isReply = true;
                //console.log(message.text, 'is reply to ', messageTree.root.text);
                return messageTree;
            }
        }
        currentNode = currentNode.next;
    }
    
    return null;
}
function deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}
function getRecentGroupMessage(groupObject)
{
    if(!groupObject.messages)
    {
        return null;
    }
    let currentNode = groupObject.messages.front;
    let lastMessage = null;
    while (currentNode) {
        let messageObject = currentNode.data.root;
        lastMessage = messageObject;
        currentNode = currentNode.next;
    }
    return lastMessage;
}
function getLastMessageWithSpecificUser(user) {
    let currentNode = currentUser.messages.front;
    let lastMessage = null;
    if (!currentNode) {
        return lastMessage;
    }
    while (currentNode) {
        let messageObject = currentNode.data.root;

        if (
            (messageObject.sender === currentUser.phoneNumber && messageObject.receiver === user.phoneNumber) ||
            (messageObject.receiver === currentUser.phoneNumber && messageObject.sender === user.phoneNumber)
        )        {
            lastMessage = messageObject;
        }
        currentNode = currentNode.next;
    }
    return lastMessage;
}
function markGroupMessagesAsSeen(group)
{
    let currentNode=  null;
    if(group.messages)
    {
        currentNode = group.messages.front;
    }
    
    while (currentNode) {
        let messageObject = currentNode.data.root;
        Object.setPrototypeOf(messageObject, Message.prototype);
        if (
            (messageObject.sender != currentUser.phoneNumber)
        )        {
            messageObject.updateStatus(true);
        }
        currentNode = currentNode.next;
    }
    saveUsersToStorage();
}
function markMessageAsSeen(user)
{
    let currentNode = currentUser.messages.front;
    while (currentNode) {
        let messageObject = currentNode.data.root;
        Object.setPrototypeOf(messageObject, Message.prototype);
        if (
            (messageObject.receiver === currentUser.phoneNumber && messageObject.sender === user.phoneNumber)
        )        {
            messageObject.updateStatus(true);
        }
        currentNode = currentNode.next;
    }

    currentNode = user.messages.front;
    while (currentNode) {
        let messageObject = currentNode.data.root;

        Object.setPrototypeOf(messageObject, Message.prototype);
        if (
            (messageObject.receiver == currentUser.phoneNumber && messageObject.sender == user.phoneNumber)
        )        {
            messageObject.updateStatus(true);
            console.log('texmsgObjt: ',messageObject);
        }
        currentNode = currentNode.next;
    }
    saveUsersToStorage();
}
function countUnreadMessages(user)
{
    let currentNode = currentUser.messages.front;
    let count = 0;
    while (currentNode) {
        let messageObject = currentNode.data.root;
        Object.setPrototypeOf(messageObject, Message.prototype);
        ///.log('Reading msg from: ',messageObject.sender);
        if (
            (messageObject.receiver === currentUser.phoneNumber && messageObject.sender === user.phoneNumber)
        )        {
           // console.log(messageObject.text);
            if(!messageObject.isSeen)
            {
                count++;
            }
        }
        currentNode = currentNode.next;
    }
    return count;
}
function countGroupUnreadMessages(groupObject)
{
    if(!groupObject.messages)
    {
        return null;
    }
    let currentNode = groupObject.messages.front;
    let count = 0;
    while (currentNode) {
        let messageObject = currentNode.data.root;
        Object.setPrototypeOf(messageObject, Message.prototype);
        ///.log('Reading msg from: ',messageObject.sender);
        if(messageObject.sender != currentUser.phoneNumber)
        {
            if(!messageObject.isSeen)
            {
                count++;
            }
        }
        currentNode = currentNode.next;
    }
    return count;
}
function FindUser(phone) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].phoneNumber === phone) {
            return users[i];
        }
    }
    return null;
}

function AddContactToAUser() {
    console.log(users.length);
    const name = document.getElementById('contact-name').value;
    const phone = document.getElementById('contact-phone').value;

    let count = 0;
    for (let i = 0; i < users.length; i++) {
        if (users[i].phoneNumber === phone) {
            currentUser = FindUser(currentUser.phoneNumber);
            users[i].nickname = name;

            if(currentUser.addContact(users[i])) {
                saveUsersToStorage();

                if (currentUser.checkContactExistence(users[i].phoneNumber)) {
                    if (!(users[i].checkContactExistence(currentUser.phoneNumber))) {
                        users[i].addRequest(currentUser.phoneNumber);
                        saveUsersToStorage();
                    }
                }
            }


            count++;
        }
    }
    if(count === 0)
    {
        alert('not found');
    }
}

function SetPfpPic() {
    const text = document.getElementById('pfpPic');
    text.textContent = currentUser.username.charAt(0).toUpperCase();
}
function initializeDropdown()
{
    document.querySelectorAll('.conversation-item-dropdown-toggle').forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault()
            const dropdown = this.parentElement;
            if(dropdown.classList.contains('active')) {
                dropdown.classList.remove('active')
            } else {
                document.querySelectorAll('.conversation-item-dropdown').forEach(function(i) {
                    i.classList.remove('active')
                })
                dropdown.classList.add('active')
            }
        })
    })
    
    // Removing dropdown when clicked outside
    document.addEventListener('click', function(e) {
        if(!e.target.matches('.conversation-item-dropdown, .conversation-item-dropdown *')) {
            document.querySelectorAll('.conversation-item-dropdown').forEach(function(i) {
                i.classList.remove('active')
            })
        }
    })
}

function renderContactsForGroupCreation() {
    let group = new Group();
    const contactsSection = document.getElementById('contacts-section');
    contactsSection.innerHTML = '';

    console.log(FindUser(currentUser.phoneNumber).getContacts());
    const size = FindUser(currentUser.phoneNumber).getContacts().size;
    let current = FindUser(currentUser.phoneNumber).getContacts().peek();
    console.log('currrrrrrrrrr',current);
    for (let i = 0; i < size; i++) {
        if(current)
        {
            if (current.data.username) {
                const contact = current.data;
                console.log(contact)
                const contactDiv = document.createElement('div');
                contactDiv.classList.add('contact');
                contactDiv.innerHTML = `
                    <div class="content-message-image" style="background-color: var(--slate-100); border: 2px solid var(--emerald-600); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px; color: var(--emerald-600); font-weight: bold; text-transform: uppercase;">
                        ${contact.username.charAt(0).toUpperCase()}
                    </div>
                    <div class="contact-details">
                        <span>${contact.username}</span>
                        <small>${contact.phoneNumber}</small>
                    </div>
                    <input type="checkbox" data-phone-number="${contact.phoneNumber}" />
                `;
    
                const checkbox = contactDiv.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        group.addMember(contact.phoneNumber);
                    }
                    // } else {
                    //     group.delete(contact.phoneNumber);
                    // }
                });
    
                contactsSection.appendChild(contactDiv);
            }
            current = current.next;
        }
    }

    document.getElementById('createGroupBtn').addEventListener('click', () => {
        const groupName = document.getElementById('groupName').value.trim();
        if (!groupName) {
            alert('Please enter a valid group name');
            return;
        }
        if (group.size === 0) {
            alert('Please select at least one contact');
            return;
        }
        group.setName(groupName);
        group.creator = currentUser.username;
        group.addMember(currentUser.phoneNumber);

        FindUser(currentUser.phoneNumber).addContact(group);
        FindUser(currentUser.phoneNumber).addGroup(group);

        console.log(group.members[0]);
        for (let i = 0; i < group.members.length; i++) {
            console.log(group.members[i] instanceof User);

            if (group.members[i] !== currentUser.phoneNumber) {
                FindUser(group.members[i]).addGroup(group);
                FindUser(group.members[i]).addContact(group);
            }

        }
        saveUsersToStorage();

        console.log('Group Name:', groupName);
        console.log('Group:', group);
        console.log(group.members[0])
        console.log(FindUser(currentUser.phoneNumber).getContacts());
        //alert("Group Created Successfully");
        window.location.href = "index.html";
    });
}

function showGroupDescription(group) {
    const groupTopDiv = document.getElementById('conversationTop');
    const groupMainDiv = document.getElementById('conversationMain');
    const groupFormDiv = document.getElementById('conversationForm');
    groupTopDiv.style.display = 'none';
    groupMainDiv.style.display = 'none';
    groupFormDiv.style.display = 'none';

    const groupHeaderDiv = document.getElementById('headerGrp');
    const groupContentDiv = document.getElementById('grpContainer');
    groupHeaderDiv.style.display = 'flex';
    groupContentDiv.style.display = 'block';

    const grpName = document.getElementById('grpName');
    grpName.innerHTML = "";
    grpName.textContent = group.groupName;

    const grpDate = document.getElementById('date');
    const grpCreator = document.getElementById('creator');
    grpDate.innerHTML = "";
    grpCreator.innerHTML = "";
    grpDate.textContent = "Created on: " + group.date;
    grpCreator.textContent = "Created By: " + group.creator;

    const listItem = document.getElementById('list');
    listItem.innerHTML = "";
    for (let i = 0; i < group.members.length; i++) {
        if (group.members[i] === currentUser.phoneNumber) {
            listItem.innerHTML += ` 
                <li>You</li>
            `;
        }
        else if (currentUser.checkContactExistence(group.members[i])) {
            console.log(FindUser(group.members[i]).username);
            listItem.innerHTML += ` 
                <li>${FindUser(group.members[i]).username}</li>
            `;
        }
        else {
            const uniqueID = `btn-${i}`;
            listItem.innerHTML += ` 
                <li>${group.members[i]}<button id="${uniqueID}" class="add-contact-button">Add to Contacts</button></li>
            `;
        }
    }
    // Add event listeners to all buttons after they are added to the DOM
    const buttons = document.querySelectorAll('.add-contact-button');
    buttons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if(group.members[index] === currentUser.phoneNumber) {
                index++;
            }
            document.cookie = `phoneNumber=${group.members[index]};`;
            window.location.href = "contact-form.html";
        });
    });

    const exit = document.getElementById("exitBtn");
    exit.addEventListener('click', (e) => {
        e.preventDefault()
        exitGroup(group);
    })
}

function goBackFromGrpInfo() {
    const groupTopDiv = document.getElementById('conversationTop');
    const groupMainDiv = document.getElementById('conversationMain');
    const groupFormDiv = document.getElementById('conversationForm');
    groupTopDiv.style.display = 'flex';
    groupMainDiv.style.display = 'block';
    groupFormDiv.style.display = 'flex';

    const groupHeaderDiv = document.getElementById('headerGrp');
    const groupContentDiv = document.getElementById('grpContainer');
    groupHeaderDiv.style.display = 'none';
    groupContentDiv.style.display = 'none';
}

function exitGroup(group) {
    for (let i = 0; i < group.members.length; i++) {
        console.log("hyy", group.members[i]);
        if (group.members[i]) {
            console.log("grp", FindUser(group.members[i]).getGroups().getGroup(group.grpID));
            FindUser(group.members[i]).getGroups().getGroup(group.grpID).removeMember(currentUser.phoneNumber);
            // console.log(FindUser(group.members[i]).getGroups().getGroup(group.grpID))
            saveUsersToStorage();
        }

    }
    currentUser.getGroups().removeGroup(group.grpID);
    console.log(currentUser.getContacts() instanceof Queue)
    currentUser.removeContact(group.grpID);
    saveUsersToStorage();
    const groupHeaderDiv = document.getElementById('headerGrp');
    const groupContentDiv = document.getElementById('grpContainer');
    groupHeaderDiv.style.display = 'none';
    groupContentDiv.style.display = 'none';
    renderUsers();
}

function getFormattedTimeString(timeString)
{
    console.log(timeString);
    let timePortion = '';
    if(timeString)
    {
        timePortion  = timeString.split(",")[1].trim();
        let [hourMinutes, period] = timePortion.split(" ");
        let [hour, minutes] = hourMinutes.split(":");

        let formattedTime = `${hour}:${minutes}${period}`;
        return formattedTime
    }
   
    return '';

}

document.getElementById('search-button').addEventListener('click', function(e){
    e.preventDefault();
    ContactSearch();
})

function QueuetoTier()
{
    let tier = new Tier();
    let contacts = currentUser.contacts;
    for (let contact of contacts) {
        if(contact.data.nickname)
        {
            tier.Insert(contact.data.nickname);
        }
        else if(contact.data.groupName){
            tier.Insert(contact.data.groupName);
        }

    }
    return tier;

}

function ContactSearch()
{
    let input = document.getElementById('search-input');
    let query = input.value.trim();
    let tier = QueuetoTier();
    let result = tier.SearchWithStart(query);
    let SearchedObjects=[];
    result.display();
    while(!result.isEmpty())
    {
        let user = FindContactsByName(result.dequeue());
        SearchedObjects.push(user);
    }
    console.log(SearchedObjects);
    renderSearchResults(SearchedObjects, query);
}
function FindContactsByName(name)
{
    let matchingContacts = [];
    let contacts = currentUser.contacts;
    for (let contact of contacts){
        if (contact.data.nickname === name || contact.data.groupName === name)
        {
            matchingContacts.push(contact);
        }
    }
    console.log(matchingContacts);
    return matchingContacts;
}

function renderSearchResults(SearchedObjects, input) {
    console.log("input", input)
    console.log("l", SearchedObjects)

    if (input !== "") {
        console.log("hii");
        const results = document.getElementById('user-list');
        results.innerHTML = "";
        for (let i = 0; i < SearchedObjects.length; i++) {
            console.log(SearchedObjects[i][0].data);
            const listItem = document.createElement('li');

            if(SearchedObjects[i][0].data.username) {
                let user = FindUser(SearchedObjects[i][0].data.phoneNumber);
                let lastMessage = getLastMessageWithSpecificUser(SearchedObjects[i][0].data);
                //console.log('contact ', user);
                listItem.innerHTML = `
                <a href="#" data-conversation="#conversation-template" data-phone-number="${user.phoneNumber}">
                    <div class="content-message-image" style="background-color: var(--slate-100); border: 2px solid var(--emerald-600); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px; color: var(--emerald-600); font-weight: bold; text-transform: uppercase;">
                        ${user.nickname.charAt(0).toUpperCase()}
                    </div>
                    <span class="content-message-info">
                        <span class="content-message-name">${user.nickname}</span>
                        <span class="content-message-text">${user.phoneNumber}</span>
                    </span>
                    <span class="content-message-more">
                        <!--${user.unreadMessages > 0 ? `<span class="content-message-unread">${user.unreadMessages}</span>` : ''}
                        <span class="content-message-time">${user.lastMessageTime}</span>-->
                    </span>
                </a>
            `;
                results.appendChild(listItem);
            }
            else {
                console.log("id", SearchedObjects[i][0].data.grpID);
                let group = currentUser.getGroups().getGroup(SearchedObjects[i][0].data.grpID);
                console.log(currentUser.getGroups());
                //console.log('contact ', user);
                if (group) {
                    listItem.innerHTML = `
                <a href="#" data-conversation="#conversation-template" data-group-id="${group.grpID}">
                    <img src="images/noGrpPfp.png" alt="Group Pic" class="content-message-image" style="background-color: var(--slate-100); border: 2px solid var(--emerald-600); border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                    <span class="content-message-info">
                        <span class="content-message-name">${group.groupName}</span>
                        <!--<span class="content-message-text"></span>-->
                    </span>
                    <span class="content-message-more">
                    </span>
                </a>
            `;
                    results.appendChild(listItem);
                }

            }
        }

        openConversation();
    }
    else {
        renderUsers();
    }
}

//graph for suggestion
function UserGraph()
{
    let nodes = GetAllNodes();
    let adjacencyMatrix = GetAdjacencyMatrix();
    let graph = new Graph(nodes,adjacencyMatrix);
    return graph; 
    
}
function FindSuggestion()
{
    let graph = UserGraph();
    let suggestions = graph.suggestConnections(currentUser.phoneNumber);
    let suggestedContacts = [];
    for(let suggestion of suggestions)
    {
        let user = FindUser(suggestion)
        suggestedContacts.push(user);
    }
    console.log("suggestions ",suggestedContacts);
    return suggestedContacts;
}


function GetAllNodes()
{
    let nodes = [];
    for(i=0;i<users.length;i++)
    {
        if (users[i]  && users[i].phoneNumber) {
            let node = new GraphNode(users[i].phoneNumber, users[i].username);   
            nodes.push(node);
        } else {
            console.error("Invalid user data for index " + i);
        }
    }
    return nodes;
}

function GetAdjacencyMatrix() {
    const size = users.length;
    const adjacencyMatrix = Array.from({ length: size }, () => Array(size).fill(0));

    // Map usernames to indices
    const usernameToIndex = {};
    for (let i = 0; i < size; i++) {
        usernameToIndex[users[i].username] = i;
    }
    // adjacency matrix
    for (let i = 0; i < size; i++) {
        const user = users[i];
        const contacts = user.contacts;
        for(let contact of contacts) {
            if(contact.data.username)
            {
                const contactIndex = usernameToIndex[contact.data.username];
                if (contactIndex !== undefined) {
                    //after finding mark connection as 1
                    adjacencyMatrix[i][contactIndex] = 1;
                }
            }
        }
    }

    return adjacencyMatrix;
}

function renderSuggestions() {
    const grpDiv = document.getElementById("graph");
    const i = document.getElementById("ch");
    const p = document.getElementById("msg");

    grpDiv.classList.add("hidden");
    i.style.display = 'block';
    p.style.display = 'block';

    const title = document.getElementById("title");
    title.textContent = "Suggestions";

    const suggestionsList = document.getElementById('user-list');
    suggestionsList.innerHTML = "";
    let suggestions = FindSuggestion();

    for(let i = 0; i < suggestions.length; i++)  {
        console.log(suggestions[i]);
        const listItem = document.createElement('li');

        if(suggestions[i]) {
            let user = suggestions[i];
            //console.log('contact ', user);
            listItem.innerHTML = `
                <a href="#" data-conversation="#conversation-template" data-phone-number="${user.phoneNumber}">
                    <div class="content-message-image" style="background-color: var(--slate-100); border: 2px solid var(--emerald-600); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px; color: var(--emerald-600); font-weight: bold; text-transform: uppercase;">
                        ${user.username.charAt(0).toUpperCase()}
                    </div>
                    <span class="content-message-info">
                        <span class="content-message-name">${user.username}</span>
                        <span class="content-message-text">${user.phoneNumber}</span>
                    </span>
                </a>
            `;
        }

        suggestionsList.appendChild(listItem);
    }
    displayOptionToAddContact();
}

function DisplayUserConnectionsGraph() {
    renderUsers(false);

    const grpDiv = document.getElementById("graph");
    const i = document.getElementById("ch");
    const p = document.getElementById("msg");

    grpDiv.classList.toggle("hidden");
    i.style.display = 'none';
    p.style.display = 'none';


    let graph = UserGraph();
    console.log('Rendering graph...');
    graph.initializeVisualization();
}