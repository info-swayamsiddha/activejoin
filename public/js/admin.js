let users = [];

// Check admin access
document.addEventListener('DOMContentLoaded', async () => {
  const token = getToken();
  const user = getUser();
  
  if (!token || !user || user.userType !== 'admin') {
    window.location.href = '/';
    return;
  }
  
  await loadAdminUsers();
});

// Load users for admin
async function loadAdminUsers() {
  try {
    const response = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (response.ok) {
      users = await response.json();
      displayUsersInTable(users);
    } else {
      showAlert('Failed to load users', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('Server error', 'error');
  }
}

function displayUsersInTable(users) {
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.userType}</td>
      <td>${user.city}</td>
      <td>${user.interests?.join(', ') || ''}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editUser('${user._id}')">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteUser('${user._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Modal functions
function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Add New User';
  document.getElementById('userForm').reset();
  document.getElementById('userId').value = '';
  document.getElementById('userModal').style.display = 'block';
}

function editUser(userId) {
  const user = users.find(u => u._id === userId);
  if (!user) return;

  document.getElementById('modalTitle').textContent = 'Edit User';
  document.getElementById('userId').value = user._id;
  document.getElementById('modalUserType').value = user.userType;
  document.getElementById('modalName').value = user.name;
  document.getElementById('modalEmail').value = user.email;
  document.getElementById('modalCity').value = user.city;
  document.getElementById('modalInterests').value = user.interests.join(', ');
  document.getElementById('modalProfile').value = user.profile || '';
  document.getElementById('userModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('userModal').style.display = 'none';
}

// Handle form submission
document.getElementById('userForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const userId = document.getElementById('userId').value;
  const formData = {
    name: document.getElementById('modalName').value,
    email: document.getElementById('modalEmail').value,
    password: document.getElementById('modalPassword').value,
    city: document.getElementById('modalCity').value,
    interests: document.getElementById('modalInterests').value,
    userType: document.getElementById('modalUserType').value,
    profile: document.getElementById('modalProfile').value
  };

  try {
    const url = userId ? `/api/admin/users/${userId}` : '/api/admin/users';
    const method = userId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      showAlert(userId ? 'User updated successfully!' : 'User added successfully!', 'success');
      closeModal();
      await loadAdminUsers();
    } else {
      showAlert(data.message || 'Operation failed', 'error');
    }
  } catch (error) {
    showAlert('Server error', 'error');
  }
});

// Delete user
async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (response.ok) {
      showAlert('User deleted successfully!', 'success');
      await loadAdminUsers();
    } else {
      showAlert('Failed to delete user', 'error');
    }
  } catch (error) {
    showAlert('Server error', 'error');
  }
}