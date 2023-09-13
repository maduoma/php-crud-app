$(document).ready(function () {
    var table = $("#userTable").DataTable({
        ajax: {
            url: "php/crud.php",
            type: "POST",
            data: { action: "read" },
            dataSrc: ""
        },
        columns: [
            { data: "profile_picture", render: function (data) { return `<img src='uploads/${data}' width='50' height='50'>`; } },
            { data: "name" },
            { data: "created_time", render: function (data) { return moment(data).format('MMMM Do YYYY, h:mm:ss a'); } },
            { data: "updated_time", render: function (data) { return moment(data).format('MMMM Do YYYY, h:mm:ss a'); } },
            { data: "department" },
            { data: "file_names" },
            { data: null, render: function (data) { return `<div class='button-container'><button class='btn btn-primary btn-edit'><i class="fas fa-edit"></i></button> <button class='btn btn-danger btn-delete'><i class="fas fa-trash-alt"></i></button> <button class='btn btn-info btn-view-files'><i class="fas fa-file"></i></button></div>`; } }
        ]

    });

    // Clear modal content function
    function clearModal() {
        $('#userId').val('');
        $('#name').val('');
        $('#department').val('HR');
        $('#profilePicture').val('');
        $('#multipleFiles').val('');
    }

    $("#userModal").on("hidden.bs.modal", function () {
        clearModal();
    });

    function createUser(formData) {
        $.ajax({
            url: "php/crud.php",
            type: "POST",
            processData: false,
            contentType: false,
            data: formData,
            success: function (response) {
                var res = JSON.parse(response);
                if (res.statusCode === 200) {
                    Swal.fire({
                        title: "Success!",
                        text: "User Created",
                        icon: "success",
                    });
                    $("#userModal").modal("hide");
                    table.ajax.reload();
                } else {
                    Swal.fire({
                        title: "Error!",
                        text: "User Creation Failed",
                        icon: "error",
                    });
                }
            }
        });
    }

    function updateUser(formData) {
        $.ajax({
            url: "php/crud.php",
            type: "POST",
            processData: false,
            contentType: false,
            data: formData,
            success: function (response) {
                var res = JSON.parse(response);
                if (res.statusCode === 200) {
                    Swal.fire({
                        title: "Success!",
                        text: "User Updated",
                        icon: "success",
                    });
                    $("#userModal").modal("hide");
                    table.ajax.reload();
                } else {
                    Swal.fire({
                        title: "Error!",
                        text: "User Update Failed",
                        icon: "error",
                    });
                }
            }
        });
    }

    // Differentiating between Add and Update modal
    $('#userModal').on('show.bs.modal', function (event) {
        if ($('#userId').val()) {
            $('.modal-title').text('Update User');
            $('#saveBtn').hide();
            $('#updateBtn').show();
        } else {
            $('.modal-title').text('Add User');
            $('#saveBtn').show();
            $('#updateBtn').hide();
        }
    });

    $("#saveBtn").click(function () {
        $('#userForm').submit();
    });

    $("#updateBtn").click(function () {
        $('#userForm').submit();
    });

    $("#userForm").on("submit", function (e) {
        e.preventDefault();

        var formData = new FormData();
        formData.append("id", $("#userId").val());
        formData.append("name", $("#name").val());
        formData.append("department", $("#department").val());
        formData.append("profile_picture", $("#profilePicture")[0].files[0]);

        var files = $("#multipleFiles")[0].files;
        for (var i = 0; i < files.length; i++) {
            formData.append("multiple_files[]", files[i]);
        }

        if ($("#userId").val()) {
            formData.append("action", "update");
            updateUser(formData);
        } else {
            formData.append("action", "create");
            createUser(formData);
        }
    });

    $("#userTable tbody").on("click", ".btn-edit", function () {
        clearModal();
        var data = table.row($(this).parents("tr")).data();
        $("#userId").val(data.id);
        $("#name").val(data.name);
        $("#department").val(data.department);
        $("#userModal").modal("show");
    });

    $("#userTable tbody").on("click", ".btn-view-files", function () {
        var data = table.row($(this).parents("tr")).data();
        var fileNames = data.file_names.split(","); // Assuming file_names is a comma-separated string

        // Do something with the files, for example, display them in an alert or a modal
        alert(`Files for user ${data.name}: ${fileNames.join(", ")}`);
    });



    $("#userTable tbody").on("click", ".btn-delete", function () {
        var data = table.row($(this).parents("tr")).data();
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: "php/crud.php",
                    type: "POST",
                    data: { action: "delete", id: data.id },
                    success: function (response) {
                        var res = JSON.parse(response);
                        if (res.statusCode === 200) {
                            Swal.fire({
                                title: "Deleted!",
                                text: "User Deleted",
                                icon: "success",
                            });
                            table.ajax.reload();
                        } else {
                            Swal.fire({
                                title: "Error!",
                                text: "User Deletion Failed",
                                icon: "error",
                            });
                        }
                    }
                });
            }
        });
    });

});
