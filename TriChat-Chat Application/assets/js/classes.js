class Node {
    constructor(value) {
        this.data = value;
        this.next = null;
    }
}
class PriorityQueueNode {
    constructor(value, priority) {
        this.data = value;
        this.priority = priority;
        this.next = null;
    }
}
class TreeNode{
    constructor(root){
        this.root = root;
        this.children = [];
    }
    addChild(childNode){
        this.children.push(childNode);
    }
}

class Queue {
    constructor() {
        this.front = null;
        this.rear = null;
        this.size = 0;
    }

    enqueue(value) {
        let newNode = new Node(value);
        if (this.rear === null) {
            this.rear = newNode;
            this.front = newNode;
        } else {
            let node = this.front;
            while(node.next !=null) {
                node = node.next;
            }
            node.next = newNode;
            this.rear = newNode;
        }
        this.size++;
    }

    dequeue() {
        if (this.front === null) {
            alert("Queue Underflow");
            return -1;
        }
        else {
            let value = this.front.data;
            this.front = this.front.next;

            if (this.front === null) {
                this.rear = null;
            }
            this.size--;
            return value;   
        }
    }

    peek() {
        if (this.front === null) {
            console.log("Queue is empty.");
            return null;
        } else {
            return this.front;
        }
    }
    
    display() {
        if (this.front === null) {
            console.log("Queue is Empty");
            return -1;
        }
        else {
            let currentNode = this.front;
            let allElements = [];

            while (currentNode != null) {
                allElements.push(currentNode.data);
                currentNode = currentNode.next;
            }
            // alert(allElements.join(" "));
        }
        
    }

    isEmpty() {
        if (this.front === null) {
            return true;
        }
        else {
            return false;
        }
    }

    getSize () {
        return this.size;
    }

    checkExistance(data) {
        let currentNode = this.front;

        let count = 0;
        while (currentNode != null) {
            if (currentNode.data === data) {
                count ++;
                break;
            }
            currentNode = currentNode.next;
        }

        return count !== 0;
    }
    remove(data) {
        let currentNode = this.front;
        let previousNode = null;

        while (currentNode != null) {
            if (currentNode.data === data) {
                if (previousNode === null) {
                    // Case 1: Node to remove is the head
                    this.front = currentNode.next;
                } else {
                    // Case 2: Node to remove is in the middle or end
                    previousNode.next = currentNode.next;
                }
                if(this.front === null) {
                    this.rear = null;
                }
                return true; // Node found and removed
            }
            previousNode = currentNode;
            currentNode = currentNode.next;
        }
        if(this.front === null) {
            this.rear = null;
        }
        return false; // Node not found
    }
    *[Symbol.iterator]() {
        let currentNode = this.front;
        while (currentNode != null) {
            yield currentNode;
            currentNode = currentNode.next;
        }
    }

}

class User{
    constructor(username,  phoneNumber, nickname, lastSeen = new Date().toLocaleString(), contacts = new Queue(), messages = new PriorityQueue(), groups = new HashTable(), requests = new Queue())
    {
        this.username = username;
        this.nickname = nickname;
        this.phoneNumber = phoneNumber;
        this.lastSeen = lastSeen;
        this.contacts = contacts;
        this.isOnline = false;
        this.messages = messages;
        this.groups = groups;
        this.requests = requests;
    }

    addMsg(newMsg)
    {
        //console.log('time int: ', newMsg.root.getTimeInt());
        this.messages.enqueue(newMsg, newMsg.root.getTimeInt());
    }
    updateOnlineStatus(status)
    {
        this.isOnline = status;
    }
    addContact(newContact)
    {
        let count = 0;
        let current = this.contacts.peek();
        console.log("hillo");

        if (newContact.phoneNumber === this.phoneNumber) {
            alert("Cannot add yourself to the Contacts");
            count++;
        }

        while(current) {
            console.log("hillo");
            if (newContact instanceof User) {
                if (newContact.phoneNumber === current.data.phoneNumber) {
                    alert("Contact already exists.");
                    count++;
                    break;
                }
            }

            current = current.next;
        }

        if(count === 0) {
            this.contacts.enqueue(newContact);
            alert ("Contact successfully.");
            return true;
        }
        return false;
    }
    removeContact(id) {
        if (!this.contacts.peek()) {
            alert("No contacts to remove.");
            return;
        }

        let prev = null;
        let current = this.contacts.peek();

        while (current) {
            if (current.data.grpID === id) {
                if (prev === null) {
                    // If it's the first node, adjust the head of the list
                    this.contacts.dequeue();
                } else {
                    // Remove the current node by skipping it in the chain
                    prev.next = current.next;
                }

                alert("Contact removed successfully.");
                return;
            }

            // Move to the next node
            prev = current;
            current = current.next;
        }

        alert("Contact not found.");
    }

    addRequest(newRequest)
    {
        let count = 0;
        let current = this.requests.front;
        if (newRequest === this.phoneNumber) {
            alert("Cannot add yourself to the Requests");
            count++;
        }
        while(current) {
            console.log(newRequest)
            console.log(current.data)
            if (newRequest == current.data) {
                alert("Request already exists.");
                count++;
                break;
            }
            current = current.next;
        }

        if(count === 0) {
            this.requests.enqueue(newRequest);
            alert ("Request Added successfully.");
            return true;
        }
        return false;
    }
    updateLastSeen(seen)
    {
        this.lastSeen = seen;
    }
    getContacts() {
        return this.contacts;
    }
    getGroups() {
        return this.groups;
    }
    addGroup(newGroup) {
        this.groups.insert(newGroup);
        alert ("Group added successfully.");
    }
    getRequests() {
        return this.requests;
    }
    checkContactExistence(contact) {
        let current = this.getContacts().peek();

        let count = 0;
        while (current != null) {
            if (current.data.phoneNumber === contact) {
                count ++;
                break;
            }
            current = current.next;
        }

        return count !== 0;
    }
}
class Message{

    constructor(text, sender, receiver, isSeen = false, time =  new Date().toLocaleString())
    {
        this.id = Math.floor(Math.random() * 1000);
        this.text = text;
        this.sender = sender;
        this.receiver = receiver;
        this.isSeen = isSeen;
        this.time = time;
        this.replies = [];
    }
    getTimeInt()
    {

        // First, extract the parts of the time using a regular expression
        let regex = /(\d{1,2}):(\d{2}):(\d{2})\s(AM|PM)/;
        let matches = this.time.match(regex);

        if (matches) {
            let hour = parseInt(matches[1], 10);
            let minute = parseInt(matches[2], 10);
            let second = parseInt(matches[3], 10);
            let period = matches[4];

            // Convert the hour to 24-hour format if it's PM
            if (period === "PM" && hour !== 12) {
                hour += 12;  // Convert PM hour to 24-hour format
            } else if (period === "AM" && hour === 12) {
                hour = 0;  // 12 AM is 00 hours in 24-hour format
            }

            // Now combine hour, minute, and second into a single integer
            let timeInt = hour * 10000 + minute * 100 + second;

            return timeInt;  // For "10:30:45 PM", this will print 223045
        } else {
            console.log("Invalid time format");
            return -1;
        }

    }
    updateStatus(status)
    {
        this.isSeen = status;
    }
    addReply(replyMessage) {
        this.replies.push(replyMessage);
    }

    // Checking if the message has any replies
    hasReplies() {
        return this.replies.length > 0;
    }
}

class Group {
    constructor(groupName = "Group", creator, date = new Date()) {
        this.grpID = Math.floor(Math.random() * 1000);
        this.groupName = groupName;
        this.members = [];
        this.messages = new PriorityQueue();
        this.size = 0;
        this.creator = creator;
        this.date = date;
    }

    addMember(user) {
        if (!this.members.includes(user)) {
            this.members.push(user);
            this.size++;
        }
    }
    addMsg(newMsg)
    {
        //console.log('is pq.prototype?', Object.getPrototypeOf(this.messages) === PriorityQueue.prototype);
        this.messages.enqueue(newMsg, newMsg.root.getTimeInt());
    }
    setName(name) {
        this.groupName = name;
    }

    removeMember(user) {
        const index = this.members.indexOf(user);
        console.log(index);
        if (index !== -1) {
            this.members.splice(index, 1);
            this.size--;
            console.log(this.members);
            console.log(`${user} has been removed from the group.`);
            return true;
        } else {
            console.log(`${user} is not a member of the group.`);
            return false;
        }
    }
    static fromJSON(data) {
        const group = new Group(data.groupName, data.creator, new Date(data.date));
        group.grpID = data.grpID; // Preserve grpID
        group.members = data.members; // Restore members
        group.size = data.size; // Restore size
        return group;
    }

}

class HashTable {
    constructor(size = 17) {
        this.size = size;
        this.table = new Array(size);
    }

    hash(key) {
        return key % this.size;
    }

    insert(group) {
        const index = this.hash(group.grpID);
        const newNode = new Node(group);

        // If no collision, directly adding the node
        if (!this.table[index]) {
            this.table[index] = newNode;
        } else {
            // Handling collision by chaining in a linked list
            let current = this.table[index];
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
    }

    getGroup(key){
        const index = this.hash(key);
        let current = this.table[index];
        // Traversing the linked list to find the group
        console.log(index);
        while (current) {
            // Different types
            if(current.data) {
                if (current.data.grpID == key) {
                    //console.log('',current.data);
                    return  current.data;
                }
            }

            current = current.next;
        }
        return null;
    }

    removeGroup(key) {
        const index = this.hash(key);
        let current = this.table[index];
        let prev = null;

        while (current) {
            if (current.data.grpID === key) {
                if (prev === null) {
                    this.table[index] = current.next;
                } else {
                    prev.next = current.next;
                }
                console.log(`Group with ID ${key} removed.`);
                return current.data;
            }
            prev = current;
            current = current.next;
        }
        console.log(`Group with ID ${key} not found.`);
        return null;
    }

}

class PriorityQueue {
    constructor() {
        this.front = null;
        this.rear = null;
        this.size = 0;
    }

    enqueue(value, priority) {
        let newNode = new PriorityQueueNode(value, priority);
        if (this.rear === null) {
            this.rear = newNode;
            this.front = newNode;
        } else {
            let node = this.front;
            while(node.next !=null) {
                node = node.next;
            }
            node.next = newNode;
            this.rear = newNode;
        }
        this.size++;
    }

    dequeue() {
        if (this.front === null) {
            alert("Queue Underflow");
            return -1;
        }
        else {
            let value = this.peek();
            this.front = this.front.next;

            if (this.front === null) {
                this.rear = null;
            }
            this.size--;
            return value;
        }
    }

    peek() {
        if (this.front === null) {
            console.log("Queue is empty.");
            return null;
        } else {
           let lowestPriority = Infinity;
           let targetNode = null;
           let currentNode = this.front;

           while(currentNode != null)
           {
                if(currentNode.priority < lowestPriority)
                {
                    lowestPriority = currentNode.priority;
                    targetNode = currentNode
                }
                currentNode = currentNode.next;
           }
           return targetNode;
        }
    }

    display() {
        if (this.front === null) {
            console.log("Queue is Empty");
            return -1;
        }
        else {
            let currentNode = this.front;
            let allElements = [];

            while (currentNode != null) {
                allElements.push(currentNode.data);
                currentNode = currentNode.next;
            }
            alert(allElements.join(" "));
        }

    }

    isEmpty() {
        if (this.front === null) {
            return true;
        }
        else {
            return false;
        }
    }

    getSize () {
        return this.size;
    }
}
class TierNode{
    constructor()
    {
        this.children = {};
        this.IsEnd = false;
    }
}

class Tier{
    constructor()
    {
        this.root = new TierNode();
    }

    Insert(word)
    {
        let node = this.root;
        for(let char of word){
            if(!node.children[char])
            {
                node.children[char] = new TierNode;
            }

            node = node.children[char];
        }
        node.IsEnd = true;
    }

    SearchWord(word)
    {
        let node = this.root;
        for(let char of word){
            if(!node.children[char])
            {
                return false;
            }

            node = node.children[char];
        }
        return node.IsEnd;
    }

    SearchWithStart(prefix) {
        let node = this.root;
        for (let char of prefix) {
            if (!node.children[char]) {
                return new Queue(); // Return an empty queue if prefix not found
            }
            node = node.children[char];
        }
        return this.GetAllWordsFromNode(node, prefix);
    }
    
    GetAllWordsFromNode(node, prefix) {
        let results = new Queue();
        if (node.IsEnd) {
            results.enqueue(prefix); // Enqueue the current prefix if it's a word
        }
    
        // Loop over all children of the current node
        for (let char in node.children) {
            let childResults = this.GetAllWordsFromNode(node.children[char], prefix + char);

            while (!childResults.isEmpty()) {
                let word = childResults.dequeue(); // Dequeue the word from childResults
                results.enqueue(word); // Enqueue it to the results queue
            }
        }
    
        return results; // Return the results queue containing all the words
    }
    display() {
        let words = this.GetAllWordsFromNode(this.root, "");
        let wordList = [];

        while (!words.isEmpty()) {
            let word = words.dequeue();
            wordList.push(word); // Add it to wordList
        }
   
        console.log("Words in Tier:", wordList.join(", "));
    }
    
}

class GraphNode {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}
// Graph class to manage nodes and links
class Graph {
    constructor(nodes, adjacencyMatrix) {
        this.nodes = nodes;
        this.adjacencyMatrix = adjacencyMatrix;
        this.links = this.createLinksFromMatrix(adjacencyMatrix);
    }

    // Create links from the adjacency matrix
    createLinksFromMatrix(matrix) {
        const links = [];
        for (let i = 0; i < matrix.length; i++) {
            for (let j = i + 1; j < matrix[i].length; j++) {
                if (matrix[i][j] === 1) {
                    links.push({ source: this.nodes[i], target: this.nodes[j] });
                }
            }
        }
        return links;
    }
    
    suggestConnections(user) {
        const userIndex = this.nodes.findIndex(node => node.id === user);
        if (userIndex === -1) {
            return [];
        }
        const directConnections = new Set();
        const suggestions = new Set();
        // Get direct connections
        if (this.adjacencyMatrix[userIndex]){
            for (let i = 0; i < this.adjacencyMatrix[userIndex].length; i++) {
                if (this.adjacencyMatrix[userIndex][i] === 1) {
                    directConnections.add(i);
                }
            }
        }
        for (let neighbor of directConnections) {
            // check all connections of neighbor
            if (this.adjacencyMatrix[neighbor])
            {
                for (let j = 0; j < this.adjacencyMatrix[neighbor].length; j++) {
                    // Check if there is a connection
                    if (this.adjacencyMatrix[neighbor][j] === 1) {
                        // check if this is user itself or not
                        if (j !== userIndex) {
                            // check if already in user contacts
                            if (!directConnections.has(j)) {
                                suggestions.add(j);
                            }
                        }
                    }
                }
            }
        }

        let result = [];
        for (let index of suggestions) {
            result.push(this.nodes[index].id);
        }
        return result;
    }

    // Separate function to handle all D3-related frontend logic
    initializeVisualization() {
        d3.select("#graph").select("svg").remove();
        this.width = document.getElementById("graph").offsetWidth;
        this.height = document.getElementById("graph").offsetHeight;

        this.svg = d3.select("#graph").append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        this.simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2));

        this.createLinks();
        this.createNodes();
        this.updatePositions();
    }

    // Create and render the links (edges) between nodes
    createLinks() {
        this.link = this.svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(this.links)
            .enter().append("line")
            .attr("stroke", "#999")
            .attr("stroke-width", 2);
    }

    // Create and render the nodes
    createNodes() {
        this.node = this.svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(this.nodes)
            .enter().append("circle")
            .attr("r", 10)
            .attr("fill", "#69b3a2")
            .call(d3.drag()
                .on("start", this.dragStart.bind(this))
                .on("drag", this.dragged.bind(this))
                .on("end", this.dragEnd.bind(this)));

        // Add labels to nodes
        this.label = this.svg.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(this.nodes)
            .enter().append("text")
            .attr("dy", -15)
            .attr("text-anchor", "middle")
            .text(d => d.name);
    }

    // Update node and link positions on each tick of the simulation
    updatePositions() {
        this.simulation.on("tick", () => {
            this.link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            this.node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            this.label
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        });
    }

    // Handle drag start (fix node position)
    dragStart(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    // Handle dragging (update node position)
    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    // Handle drag end (release node)
    dragEnd(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}
  