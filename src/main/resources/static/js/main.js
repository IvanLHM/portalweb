$(document).ready(function() {
    // 加载用户列表
    loadUsers();

    // 提交表单
    $('#userForm').on('submit', function(e) {
        e.preventDefault();
        
        const userData = {
            username: $('#username').val(),
            email: $('#email').val()
        };

        $.ajax({
            url: '/api/users',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(userData),
            success: function(response) {
                alert('用户添加成功！');
                loadUsers();
                $('#userForm')[0].reset();
            },
            error: function(xhr) {
                alert('添加失败：' + xhr.responseText);
            }
        });
    });

    // 加载用户列表函数
    function loadUsers() {
        $.ajax({
            url: '/api/users',
            type: 'GET',
            success: function(users) {
                const tbody = $('#userList');
                tbody.empty();
                
                users.forEach(function(user) {
                    tbody.append(`
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td>${user.createTime}</td>
                            <td>
                                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">删除</button>
                            </td>
                        </tr>
                    `);
                });
            },
            error: function(xhr) {
                alert('加载用户列表失败：' + xhr.responseText);
            }
        });
    }

    // 删除用户函数
    window.deleteUser = function(id) {
        if (confirm('确定要删除这个用户吗？')) {
            $.ajax({
                url: `/api/users/${id}`,
                type: 'DELETE',
                success: function() {
                    alert('删除成功！');
                    loadUsers();
                },
                error: function(xhr) {
                    alert('删除失败：' + xhr.responseText);
                }
            });
        }
    }
}); 