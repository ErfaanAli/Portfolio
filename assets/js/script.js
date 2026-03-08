$(document).ready(function () {

    $('#menu').click(function () {
        $(this).toggleClass('fa-times');
        $('.navbar').toggleClass('nav-toggle');
    });

    $(window).on('scroll load', function () {
        $('#menu').removeClass('fa-times');
        $('.navbar').removeClass('nav-toggle');

        if (window.scrollY > 60) {
            document.querySelector('#scroll-top').classList.add('active');
        } else {
            document.querySelector('#scroll-top').classList.remove('active');
        }

        // scroll spy
        $('section').each(function () {
            let height = $(this).height();
            let offset = $(this).offset().top - 200;
            let top = $(window).scrollTop();
            let id = $(this).attr('id');

            if (top > offset && top < offset + height) {
                $('.navbar ul li a').removeClass('active');
                $('.navbar').find(`[href="#${id}"]`).addClass('active');
            }
        });
    });

    // smooth scrolling
    $('a[href*="#"]').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top,
        }, 500, 'linear')
    });

});

document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === "visible") {
        document.title = "Portfolio | Irfan Ali";
        $("#favicon").attr("href", "assets/images/favicon.png");
    } else {
        document.title = "Come back! | Irfan Ali";
        $("#favicon").attr("href", "assets/images/favicon.png");
    }
});

// Typed.js effect
var typed = new Typed(".typing-text", {
    strings: [
        ".NET Core &amp; Web APIs",
        "Angular &amp; TypeScript",
        "Azure Cloud &amp; DevOps",
        "Microservices Architecture",
        "Enterprise SaaS Platforms",
        "Team Leadership &amp; Mentoring"
    ],
    loop: true,
    typeSpeed: 55,
    backSpeed: 30,
    backDelay: 1200,
});

async function fetchData(type = "skills") {
    let response;
    type === "skills"
        ? (response = await fetch("skills.json"))
        : (response = await fetch("./projects/projects.json"));
    const data = await response.json();
    return data;
}

function showSkills(skills) {
    let skillsContainer = document.getElementById("skillsContainer");
    let skillHTML = "";
    skills.forEach(skill => {
        skillHTML += `
        <div class="bar">
          <div class="info">
            <img src="${skill.icon}" alt="${skill.name}" />
            <span>${skill.name}</span>
          </div>
        </div>`;
    });
    skillsContainer.innerHTML = skillHTML;
}

function showProjects(projects) {
    let projectsContainer = document.getElementById("projectsContainer");
    let projectHTML = "";
    projects
        .filter(project => project.category !== "android")
        .slice(0, 9)
        .forEach(project => {
            projectHTML += `
        <div class="box tilt">
          <img draggable="false" src="assets/images/projects/${project.image}.png" alt="${project.name}" />
          <div class="content">
            <div class="tag">
              <h3>${project.name}</h3>
            </div>
            <div class="desc">
              <p>${project.desc}</p>
              <div class="btns">
                <a href="${project.links.view}" class="btn" target="_blank"><i class="fas fa-eye"></i> View</a>
              </div>
            </div>
          </div>
        </div>`;
        });
    projectsContainer.innerHTML = projectHTML;

    VanillaTilt.init(document.querySelectorAll(".tilt"), { max: 12 });
    srtop.reveal('.work .box', { interval: 200 });
}

fetchData().then(data => {
    showSkills(data);
});

fetchData("projects").then(data => {
    showProjects(data);
});

VanillaTilt.init(document.querySelectorAll(".tilt"), { max: 12 });

// Disable dev tools shortcuts
document.onkeydown = function (e) {
    if (e.keyCode == 123) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) return false;
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false;
};

/* ===== SCROLL REVEAL ANIMATION ===== */
const srtop = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 900,
    reset: false
});

/* Hero */
srtop.reveal('.home .greeting', { delay: 100 });
srtop.reveal('.home .content h2', { delay: 200 });
srtop.reveal('.home .content .hero-subtitle', { delay: 300 });
srtop.reveal('.home .content p', { delay: 350 });
srtop.reveal('.home .socials', { delay: 400 });
srtop.reveal('.home .hero-btns', { delay: 500 });
srtop.reveal('.home .image', { delay: 300, origin: 'right' });

/* About */
srtop.reveal('.about .image', { delay: 200, origin: 'left' });
srtop.reveal('.about .content h3', { delay: 200 });
srtop.reveal('.about .content .tag', { delay: 250 });
srtop.reveal('.about .stats-row', { delay: 300 });
srtop.reveal('.about .stat-item', { interval: 100 });
srtop.reveal('.about .profile-intro', { delay: 350 });
srtop.reveal('.about .resumebtn', { delay: 400 });

/* Services */
srtop.reveal('.service-card', { interval: 120 });

/* Skills */
srtop.reveal('.skills .container', { delay: 200 });
srtop.reveal('.skills .bar', { interval: 80 });

/* Education */
srtop.reveal('.education .box', { interval: 250 });

/* Certifications */
srtop.reveal('.cert-card', { interval: 150 });

/* Projects */
srtop.reveal('.work .box', { interval: 200 });

/* Experience */
srtop.reveal('.experience .container', { interval: 300 });

/* Testimonials */
srtop.reveal('.testimonial-card', { interval: 180 });

/* Contact */
srtop.reveal('.hire-cta-banner', { delay: 200 });
srtop.reveal('.contact-info-card', { interval: 150 });
srtop.reveal('.contact .contact-image', { delay: 300, origin: 'right' });
