(function () {
  const container = document.getElementById("projectsContainer");
  const filterBar = document.getElementById("filters");
  if (!container) return;

  let allProjects = [];

  function render(category) {
    const filtered = category === "*" ? allProjects : allProjects.filter(p => p.category === category);

    if (!filtered.length) {
      container.innerHTML = `<p class="empty-state">No projects in this category yet.</p>`;
      return;
    }

    container.innerHTML = filtered.map(project => `
      <div class="box tilt">
        <img draggable="false" src="../assets/images/projects/${project.image}.png" alt="${project.name}" />
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
      </div>`).join("");

    if (window.VanillaTilt) {
      VanillaTilt.init(container.querySelectorAll(".tilt"), { max: 8 });
    }
  }

  fetch("./projects.json")
    .then(res => res.json())
    .then(data => {
      allProjects = data;
      render("*");
    });

  if (filterBar) {
    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filterBar.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      render(btn.dataset.filter);
    });
  }
})();
