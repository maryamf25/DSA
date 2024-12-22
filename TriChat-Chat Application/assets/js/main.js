// Sidebar Start
document.querySelector('.chat-sidebar-profile-toggle').addEventListener('click', function(e) {
    e.preventDefault()
    this.parentElement.classList.toggle('active')
})

document.addEventListener('click', function(e) {
    if(!e.target.matches('.chat-sidebar-profile, .chat-sidebar-profile *')) {
        document.querySelector('.chat-sidebar-profile').classList.remove('active')
    }
})
// Sidebar End

// Conversation Start
document.querySelectorAll('.conversation-form-input').forEach(function(item) {
    item.addEventListener('input', function() {
        this.rows = this.value.split('\n').length
    })
})


document.querySelectorAll('.conversation-back').forEach(function(item) {
    item.addEventListener('click', function(e) {
        e.preventDefault()
        this.closest('.conversation').classList.remove('active')
        document.querySelector('.conversation-default').classList.add('active')
    })
})

document.addEventListener("DOMContentLoaded", () => {
    const profileButton = document.getElementById("profile-button");
    const dropdownMenu = document.getElementById("dropdown-menu");
    const drp = document.getElementById("drp");
    const pic = document.getElementById("pic");
    const name = document.getElementById("name");
    const phone = document.getElementById("phn");

    profileButton.addEventListener("click", (e) => {
        e.preventDefault();
        drp.style.visibility = 'hidden';
        dropdownMenu.classList.toggle("hidden");
        pic.textContent = currentUser.username.charAt(0).toUpperCase();
        name.textContent = currentUser.username.toUpperCase();
        phone.textContent = currentUser.phoneNumber;
    });

    document.addEventListener("click", (event) => {
        if (!dropdownMenu.contains(event.target) && !profileButton.contains(event.target)) {
            drp.style.visibility = 'visible';
            dropdownMenu.classList.add("hidden");
        }
    });

    const logoutButton = document.querySelector(".logout-button");
    logoutButton.addEventListener("click", () => {
        window.location.href = "login.html";
    });
});


// Select all <a> elements inside the chat-sidebar-menu
// Select all <a> elements inside the chat-sidebar-menu
const menuItems = document.querySelectorAll(".chat-sidebar-menu > li > a");

menuItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    // Check if the link has a function to execute
    if (!item.hasAttribute("onclick")) {
      // Allow navigation for links like 'group-creation.html'
      return;
    }

    // Prevent default behavior for links with custom functions
    event.preventDefault();

    // Remove the 'active' class from any currently active <li>
    document.querySelector(".chat-sidebar-menu > .active")?.classList.remove("active");

    // Add the 'active' class to the parent <li> of the clicked <a>
    item.parentElement.classList.add("active");

    // // Execute the linked function (handled via the `onclick` attribute in HTML)
    // const functionName = item.getAttribute("onclick").replace("()", "");
    // if (typeof window[functionName] === "function") {
    //   window[functionName]();
    // }
  });
});
