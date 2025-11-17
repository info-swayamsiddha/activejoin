// Utility Functions
function showAlert(message, type) {
  const alert = document.getElementById('alert');
  if (alert) {
    alert.textContent = message;
    alert.className = `alert ${type}`;
    alert.style.display = 'block';
    setTimeout(() => {
      alert.style.display = 'none';
    }, 3000);
  }
}

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  const token = getToken();
  const user = getUser();
  
  if (token && user) {
    const adminLink = document.getElementById('adminLink');
    if (adminLink && user.userType === 'admin') {
      adminLink.classList.remove('hidden');
    }
  }
});

// Show dashboard
async function showDashboard() {
  const token = getToken();
  if (!token) {
    window.location.href = '/login';
    return;
  }

  document.getElementById('landingSection').classList.add('hidden');
  document.getElementById('dashboardSection').classList.remove('hidden');

  await loadUsers();
}

// Load and display users
async function loadUsers() {
  try {
    const response = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (response.ok) {
      const users = await response.json();
      displayUsers(users);
      populateCityFilter(users);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

function displayUsers(users) {
  const usersList = document.getElementById('usersList');
  const currentUser = getUser();
  
  // Filter out current user and don't show passwords
  const displayUsers = users.filter(u => u._id !== currentUser.id);
  
  usersList.innerHTML = displayUsers.map(user => `
    <div class="user-card">
      <h3>${user.name} (${user.userType})</h3>
      <p><strong>City:</strong> ${user.city}</p>
      <p><strong>About:</strong> ${user.profile || 'No description'}</p>
      <div class="interests">
        ${user.interests?.map(interest => `<span class="interest-tag">${interest}</span>`).join('') || ''}
      </div>
    </div>
  `).join('');
}

function populateCityFilter(users) {
  const cityFilter = document.getElementById('cityFilter');
  const cities = [...new Set(users.map(u => u.city))].sort();
  
  // Keep first option (All Cities)
  cityFilter.innerHTML = '<option value="">All Cities</option>';
  
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    cityFilter.appendChild(option);
  });
}

function filterByCity() {
  const selectedCity = document.getElementById('cityFilter').value;
  const userCards = document.querySelectorAll('.user-card');
  
  userCards.forEach(card => {
    const cityText = card.querySelector('p').textContent;
    const userCity = cityText.replace('City: ', '');
    
    if (!selectedCity || userCity === selectedCity) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}