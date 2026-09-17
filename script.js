// =========================
// NIGERIAN STATES
// =========================

const states = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
    "Federal Capital Territory"
];


// =========================
// FORM VALIDATION HELPERS
// =========================

function clearFieldErrors(form) {

    form.querySelectorAll(".input-error").forEach(function(input) {
        input.classList.remove("input-error");
        input.removeAttribute("aria-invalid");
    });

    form.querySelectorAll(".field-message").forEach(function(message) {
        message.remove();
    });
}


function showFieldError(inputId, message, linkText, linkHref) {

    const input = document.getElementById(inputId);

    if (!input) {
        return;
    }

    const group = input.closest(".form-group");
    const fieldMessage = document.createElement("div");

    input.classList.add("input-error");
    input.setAttribute("aria-invalid", "true");
    fieldMessage.className = "field-message";
    fieldMessage.setAttribute("role", "alert");

    const messageText = document.createElement("span");
    messageText.textContent = message;
    fieldMessage.appendChild(messageText);

    if (linkText && linkHref) {
        const link = document.createElement("a");
        link.href = linkHref;
        link.textContent = linkText;
        fieldMessage.appendChild(link);
    }

    group.appendChild(fieldMessage);
    input.focus();
}


function showRequiredFieldError(form) {

    const invalidInput = form.querySelector(":invalid");

    if (!invalidInput) {
        return false;
    }

    const label = form.querySelector('label[for="' + invalidInput.id + '"]');
    const labelText = label ? label.textContent.trim() : "This field";

    showFieldError(
        invalidInput.id,
        invalidInput.validity.valueMissing
            ? labelText + " is required."
            : invalidInput.validationMessage
    );

    return true;
}


// =========================
// STATE DROPDOWN
// =========================

function populateStateDropdown(selectElement) {

    if (!selectElement) {
        return;
    }

    const existingPlaceholder =
        document.createElement("option");

    existingPlaceholder.value = "";
    existingPlaceholder.textContent =
        "Select your state";

    selectElement.innerHTML = "";
    selectElement.appendChild(existingPlaceholder);

    states.forEach(function(state) {

        const option = document.createElement("option");

        option.value = state;
        option.textContent = state;

        selectElement.appendChild(option);

    });

}

const stateSelect = document.getElementById("state");

if (stateSelect) {
    populateStateDropdown(stateSelect);
}

const editStateSelect = document.getElementById("editState");

if (editStateSelect) {
    populateStateDropdown(editStateSelect);
}


// =========================
// FIREBASE REGISTRATION
// =========================

const registrationForm =
    document.getElementById("registrationForm");

const formMessage =
    document.getElementById("formMessage");

if (registrationForm) {

    registrationForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            clearFieldErrors(registrationForm);

            if (showRequiredFieldError(registrationForm)) {
                return;
            }


            // =========================
            // GET FORM VALUES
            // =========================

            const fullName =
                document.getElementById("fullName").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;

            const phone =
                document.getElementById("phone").value.trim();

            const studentType =
                document.getElementById("studentType").value;

            const institutionType =
                document.getElementById("institutionType").value;

            const state =
                document.getElementById("state").value;

            const institution =
                document.getElementById("institution").value.trim();

            const studentId =
                document.getElementById("studentId").value.trim();

            const course =
                document.getElementById("course").value;


            // =========================
            // PHONE VALIDATION
            // =========================

            const phonePattern =
                /^(\+234|0)[789][01]\d{8}$/;

            if (!phonePattern.test(phone)) {

                showFieldError(
                    "phone",
                    "Please enter a valid Nigerian phone number."
                );

                return;
            }


            // =========================
            // EMAIL VALIDATION
            // =========================

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {

                showFieldError(
                    "email",
                    "Please enter a valid email address."
                );

                return;
            }


            // =========================
            // PASSWORD LENGTH
            // =========================

            if (password.length < 6) {

                showFieldError(
                    "password",
                    "Password must be at least 6 characters."
                );

                return;
            }


            // =========================
            // PASSWORD MATCH
            // =========================

            if (password !== confirmPassword) {

                showFieldError(
                    "confirmPassword",
                    "Passwords do not match."
                );

                return;
            }


            // =========================
            // CREATE FIREBASE ACCOUNT
            // =========================

            formMessage.textContent =
                "Creating your account...";

            formMessage.style.color = "#2563eb";


            firebase.auth()
                .createUserWithEmailAndPassword(
                    email,
                    password
                )

                .then(function(userCredential) {

                    const user =
                        userCredential.user;


                    // =========================
                    // SAVE STUDENT INFORMATION
                    // =========================

                    return db
                        .collection("students")
                        .doc(user.uid)
                        .set({

                            fullName: fullName,

                            email: email,

                            phone: phone,

                            studentType: studentType,

                            institutionType:
                                institutionType,

                            state: state,

                            institution:
                                institution,

                            studentId:
                                studentId,

                            course: course,

                            createdAt:
                                firebase.firestore
                                    .FieldValue
                                    .serverTimestamp()

                        })
                        .catch(function(profileError) {

                            console.error(
                                "Student profile could not be saved:",
                                profileError
                            );

                            return user
                                .delete()
                                .then(function() {

                                    profileError.code =
                                        "auth/profile-save-failed";

                                    throw profileError;

                                }, function(deleteError) {

                                    console.error(
                                        "Could not roll back the Auth account:",
                                        deleteError
                                    );

                                    profileError.code =
                                        "auth/profile-save-rollback-failed";

                                    throw profileError;

                                });

                        });

                })

                .then(function() {

                    formMessage.textContent =
                        "Account created successfully! 🎉";

                    formMessage.style.color =
                        "green";


                    setTimeout(function() {

                        window.location.href =
                            "login.html";

                    }, 1500);

                })

                .catch(function(error) {

                    console.error(error);

                    formMessage.textContent = "";


                    if (
                        error.code ===
                        "auth/email-already-in-use"
                    ) {

                        showFieldError(
                            "email",
                            "This email is already registered.",
                            "Log in instead.",
                            "login.html"
                        );

                    }

                    else if (
                        error.code ===
                        "auth/invalid-email"
                    ) {

                        showFieldError(
                            "email",
                            "Please enter a valid email address."
                        );

                    }

                    else if (
                        error.code ===
                        "auth/weak-password"
                    ) {

                        showFieldError(
                            "password",
                            "Password is too weak."
                        );

                    }

                    else if (
                        error.code ===
                        "auth/profile-save-failed"
                    ) {

                        formMessage.textContent =
                            "We could not save your student information. Please try again.";

                    }

                    else if (
                        error.code ===
                        "auth/profile-save-rollback-failed"
                    ) {

                        formMessage.textContent =
                            "Registration could not be completed. Please contact support before trying again.";

                    }

                    else {

                        formMessage.textContent =
                            "Registration failed. Please try again.";

                    }

                    formMessage.style.color =
                        "red";

                });

        }
    );

}


// =========================
// STUDENT TYPE
// =========================

const studentTypeSelect =
    document.getElementById("studentType");

const institutionInput =
    document.getElementById("institution");

const institutionTypeSelect =
    document.getElementById("institutionType");

const studentIdGroup =
    document.getElementById("studentIdGroup");


if (studentTypeSelect) {

    studentTypeSelect.addEventListener(
        "change",
        function() {

            const studentType =
                studentTypeSelect.value;


            // =========================
            // UNIVERSITY / POLYTECHNIC
            // =========================

            if (
                studentType === "university" ||
                studentType === "polytechnic"
            ) {

                institutionInput.placeholder =
                    "e.g. Ladoke Akintola University of Technology";

                institutionInput.required =
                    true;

                institutionTypeSelect.required =
                    true;

                stateSelect.required =
                    true;

                studentIdGroup.style.display =
                    "block";
            }


            // =========================
            // SECONDARY SCHOOL
            // =========================

            else if (
                studentType === "secondary"
            ) {

                institutionInput.placeholder =
                    "e.g. Government College Ibadan";

                institutionInput.required =
                    true;

                institutionTypeSelect.required =
                    true;

                stateSelect.required =
                    true;

                studentIdGroup.style.display =
                    "none";
            }


            // =========================
            // GRADUATE / PROFESSIONAL / OTHER
            // =========================

            else {

                institutionInput.placeholder =
                    "Enter your institution (optional)";

                institutionInput.required =
                    false;

                institutionTypeSelect.required =
                    false;

                stateSelect.required =
                    false;

                studentIdGroup.style.display =
                    "none";

            }

        }
    );

}


// =========================
// REGISTRATION PASSWORD VISIBILITY
// =========================

const togglePassword =
    document.getElementById("togglePassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");


if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        function() {

            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type =
                    "text";

                togglePassword.textContent =
                    "Hide";

            }

            else {

                passwordInput.type =
                    "password";

                togglePassword.textContent =
                    "Show";

            }

        }
    );

}


if (toggleConfirmPassword) {

    toggleConfirmPassword.addEventListener(
        "click",
        function() {

            if (
                confirmPasswordInput.type ===
                "password"
            ) {

                confirmPasswordInput.type =
                    "text";

                toggleConfirmPassword.textContent =
                    "Hide";

            }

            else {

                confirmPasswordInput.type =
                    "password";

                toggleConfirmPassword.textContent =
                    "Show";

            }

        }
    );

}


// =========================
// LOGIN FORM
// =========================

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            clearFieldErrors(loginForm);

            if (showRequiredFieldError(loginForm)) {
                return;
            }


            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            // =========================
            // EMAIL VALIDATION
            // =========================

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(email)) {

                showFieldError(
                    "loginEmail",
                    "Please enter a valid email address."
                );

                return;
            }


            // =========================
            // PASSWORD VALIDATION
            // =========================

            if (password.length < 6) {

                showFieldError(
                    "loginPassword",
                    "Password must be at least 6 characters."
                );

                return;
            }


            // =========================
            // FIREBASE LOGIN
            // =========================

            loginMessage.textContent =
                "Logging in...";

            loginMessage.style.color =
                "#2563eb";


            firebase.auth()
                .signInWithEmailAndPassword(
                    email,
                    password
                )

                .then(function(userCredential) {

                    loginMessage.textContent =
                        "Login successful! Redirecting... 🎉";

                    loginMessage.style.color =
                        "green";


                    setTimeout(function() {

                        window.location.href =
                            "dashboard.html";

                    }, 1000);

                })

                .catch(function(error) {

                    loginMessage.textContent = "";

                    if (
                        error.code ===
                        "auth/invalid-credential"
                    ) {

                        showFieldError(
                            "loginEmail",
                            "The email address or password you entered is incorrect.",
                            "Find your account and log in.",
                            "register.html"
                        );

                    }

                    else if (
                        error.code ===
                        "auth/user-not-found"
                    ) {

                        showFieldError(
                            "loginEmail",
                            "The email address you entered isn't connected to an account.",
                            "Create an account.",
                            "register.html"
                        );

                    }

                    else if (
                        error.code ===
                        "auth/wrong-password"
                    ) {

                        showFieldError(
                            "loginPassword",
                            "The password you entered is incorrect."
                        );

                    }

                    else {

                        loginMessage.textContent =
                            "Login failed. Please try again.";

                        console.error(error);

                    }

                    loginMessage.style.color =
                        "red";

                });

        }
    );

}


// =========================
// LOGIN PASSWORD VISIBILITY
// =========================

const toggleLoginPassword =
    document.getElementById(
        "toggleLoginPassword"
    );

const loginPasswordInput =
    document.getElementById(
        "loginPassword"
    );


if (toggleLoginPassword) {

    toggleLoginPassword.addEventListener(
        "click",
        function() {

            if (
                loginPasswordInput.type ===
                "password"
            ) {

                loginPasswordInput.type =
                    "text";

                toggleLoginPassword.textContent =
                    "Hide";

            }

            else {

                loginPasswordInput.type =
                    "password";

                toggleLoginPassword.textContent =
                    "Show";

            }

        }
    );

}


// =========================
// LOGOUT
// =========================

const logoutButtons =
    document.querySelectorAll(
        ".logout-btn, .logout-settings-btn"
    );


logoutButtons.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            firebase.auth()
                .signOut()

                .then(function() {

                    window.location.href =
                        "login.html";

                })

                .catch(function(error) {

                    console.error(error);

                });

        }
    );

});


// =========================
// CHANGE PASSWORD FORM
// =========================

const changePasswordBtn =
    document.getElementById(
        "changePasswordBtn"
    );

const changePasswordForm =
    document.getElementById(
        "changePasswordForm"
    );


if (
    changePasswordBtn &&
    changePasswordForm
) {

    changePasswordForm.style.display =
        "none";


    changePasswordBtn.addEventListener(
        "click",
        function() {

            if (
                changePasswordForm.style.display ===
                "none"
            ) {

                changePasswordForm.style.display =
                    "block";

                changePasswordBtn.textContent =
                    "Cancel";

            }

            else {

                changePasswordForm.style.display =
                    "none";

                changePasswordBtn.textContent =
                    "Change";

            }

        }
    );

}


// =========================
// COURSE NOTIFICATIONS
// =========================

const notificationSwitch =
    document.querySelector(
        ".switch input"
    );


if (notificationSwitch) {

    const savedNotification =
        localStorage.getItem(
            "courseNotifications"
        );


    if (savedNotification !== null) {

        notificationSwitch.checked =
            savedNotification === "true";

    }


    notificationSwitch.addEventListener(
        "change",
        function() {

            localStorage.setItem(
                "courseNotifications",
                notificationSwitch.checked
            );

        }
    );

}

// =========================
// DASHBOARD STUDENT DATA
// =========================

const studentNameDisplay =
    document.getElementById("studentName");

const studentCourseDisplay =
    document.getElementById("studentCourse");

const studentTypeDisplay =
    document.getElementById("studentTypeDisplay");

const courseTitleDisplay =
    document.getElementById("courseTitle");


if (
    studentNameDisplay ||
    studentCourseDisplay ||
    studentTypeDisplay ||
    courseTitleDisplay
) {

    firebase.auth().onAuthStateChanged(function(user) {

        // =========================
        // CHECK LOGIN
        // =========================

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        // =========================
        // GET STUDENT DATA
        // =========================

        db.collection("students")
            .doc(user.uid)
            .get()

            .then(function(document) {

                if (!document.exists) {

                    console.log(
                        "Student profile not found."
                    );

                    return;
                }


                const student =
                    document.data();


                // =========================
                // STUDENT NAME
                // =========================

                if (studentNameDisplay) {

                    studentNameDisplay.textContent =
                        student.fullName;
                }


                // =========================
                // STUDENT COURSE
                // =========================

                if (studentCourseDisplay) {

                    studentCourseDisplay.textContent =
                        formatCourseName(student.course);
                }


                if (courseTitleDisplay) {

                    courseTitleDisplay.textContent =
                        formatCourseName(student.course);
                }


                // =========================
                // STUDENT TYPE
                // =========================

                if (studentTypeDisplay) {

                    studentTypeDisplay.textContent =
                        formatStudentType(student.studentType);
                }

            })

            .catch(function(error) {

                console.error(
                    "Error loading student data:",
                    error
                );

            });

    });

}


// =========================
// FORMAT COURSE NAME
// =========================

function formatCourseName(course) {

    const courses = {

        frontend:
            "Frontend Development",

        backend:
            "Backend Development",

        fullstack:
            "Full Stack Development",

        programming:
            "Programming",

        uiux:
            "UI/UX Design",

        data:
            "Data Analysis"

    };


    return courses[course] || course || "Not selected";

}


// =========================
// FORMAT STUDENT TYPE
// =========================

function formatStudentType(studentType) {

    const types = {

        university:
            "University Student",

        polytechnic:
            "Polytechnic Student",

        secondary:
            "Secondary School Student",

        graduate:
            "Graduate",

        professional:
            "Working Professional",

        other:
            "Other"

    };


    return types[studentType] ||
           studentType ||
           "Not specified";

}

function showButtonLoading(button) {

    button.disabled = true;
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
    button.setAttribute("aria-label", "Loading");
    button.textContent = "Loading...";

}

// =========================
// COURSES PAGE
// =========================

if (document.getElementById("myCourseTitle")) {

    firebase.auth().onAuthStateChanged(async function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        try {

            const studentDoc = await db
                .collection("students")
                .doc(user.uid)
                .get();

            if (!studentDoc.exists) {
                console.log("Student data not found.");
                return;
            }

            const student = studentDoc.data();

            // Show student's selected course
            const courseTitle = document.getElementById("myCourseTitle");

            if (courseTitle) {
                courseTitle.textContent = formatCourseName(student.course);
            }


            // Create student initials
            const avatar = document.getElementById("studentAvatar");

            if (avatar && student.fullName) {

                const nameParts = student.fullName.trim().split(" ");

                let initials = nameParts[0].charAt(0).toUpperCase();

                if (nameParts.length > 1) {
                    initials += nameParts[nameParts.length - 1]
                        .charAt(0)
                        .toUpperCase();
                }

                avatar.textContent = initials;
            }


            // Continue Learning button
            const continueButton =
                document.getElementById("continueLearningBtn");

            if (continueButton) {

                continueButton.addEventListener("click", function() {

                    showButtonLoading(continueButton);

                });

            }


            // Course buttons
            const courseButtons =
                document.querySelectorAll(".course-btn");

            courseButtons.forEach(function(button) {

                button.addEventListener("click", function() {

                    showButtonLoading(button);

                });

            });


        } catch (error) {

            console.error(
                "Error loading courses:",
                error
            );

        }

    });

}

// =========================
// CURRENT COURSE PROGRESS
// =========================

if (document.getElementById("currentCourseProgress")) {

    firebase.auth().onAuthStateChanged(async function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        try {

            const studentDoc = await db
                .collection("students")
                .doc(user.uid)
                .get();

            if (!studentDoc.exists) {
                return;
            }

            const student = studentDoc.data();

            const progressBar =
                document.getElementById("currentCourseProgress");

            const progressText =
                document.getElementById("currentCourseProgressText");

            const totalLessons = 5;

            let completedLessons = 0;

            if (student.lesson1Completed) {
                completedLessons++;
            }

            if (student.lesson2Completed) {
                completedLessons++;
            }

            if (student.lesson3Completed) {
                completedLessons++;
            }

            if (student.lesson4Completed) {
                completedLessons++;
            }

            if (student.lesson5Completed) {
                completedLessons++;
            }

            const progress =
                Math.round(
                    (completedLessons / totalLessons) * 100
                );

            if (progressBar) {
                progressBar.style.width = progress + "%";
            }

            if (progressText) {
                progressText.textContent =
                    progress + "% completed";
            }

        } catch (error) {

            console.error(
                "Error loading course progress:",
                error
            );

        }

    });

}
// =========================
// PROFILE PAGE DATA
// =========================

async function loadProfileData() {

    const user = firebase.auth().currentUser;

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {

        const studentDoc = await db
            .collection("students")
            .doc(user.uid)
            .get();

        if (!studentDoc.exists) {
            return;
        }

        const student = studentDoc.data();

        const profileFullName =
            document.getElementById("profileFullName");

        if (profileFullName) {
            profileFullName.textContent =
                student.fullName || "Student Name";
        }

        const profileTopName =
            document.getElementById("profileTopName");

        if (profileTopName) {
            profileTopName.textContent =
                student.fullName || "Student Name";
        }

        const profileEmail =
            document.getElementById("profileEmail");

        if (profileEmail) {
            profileEmail.textContent =
                student.email || "student@example.com";
        }

        const profilePhone =
            document.getElementById("profilePhone");

        if (profilePhone) {
            profilePhone.textContent =
                student.phone || "08012345678";
        }

        const profileStudentType =
            document.getElementById("profileStudentType");

        if (profileStudentType) {
            profileStudentType.textContent =
                formatStudentType(student.studentType);
        }

        const profileInstitution =
            document.getElementById("profileInstitution");

        if (profileInstitution) {
            profileInstitution.textContent =
                student.institution || "Your Institution";
        }

        const profileState =
            document.getElementById("profileState");

        if (profileState) {
            profileState.textContent =
                student.state || "Oyo";
        }

        const profileStudentId =
            document.getElementById("profileStudentId");

        if (profileStudentId) {
            profileStudentId.textContent =
                student.studentId || "Not provided";
        }

        const profileProgram =
            document.getElementById("profileProgram");

        if (profileProgram) {
            profileProgram.textContent =
                formatCourseName(student.course);
        }

        const roleText =
            document.getElementById("profileRoleText");

        if (roleText) {
            roleText.textContent =
                student.studentType
                    ? formatStudentType(student.studentType)
                    : "ABIT Tech Hub Student";
        }

        const avatar = document.getElementById("profileAvatar");
        const headerAvatar =
            document.getElementById("profileHeaderAvatar");
        const settingsAvatar =
            document.getElementById("settingsAvatar");

        const initialsTarget =
            avatar || headerAvatar || settingsAvatar;

        if (initialsTarget && student.fullName) {

            const nameParts =
                student.fullName.trim().split(" ");

            let initials =
                nameParts[0].charAt(0).toUpperCase();

            if (nameParts.length > 1) {
                initials +=
                    nameParts[nameParts.length - 1]
                        .charAt(0)
                        .toUpperCase();
            }

            initialsTarget.textContent = initials;
        }

        const editFullName =
            document.getElementById("editFullName");

        if (editFullName) {
            editFullName.value = student.fullName || "";
        }

        const editPhone =
            document.getElementById("editPhone");

        if (editPhone) {
            editPhone.value = student.phone || "";
        }

        const editStudentType =
            document.getElementById("editStudentType");

        if (editStudentType && student.studentType) {
            editStudentType.value = student.studentType;
        }

        const editInstitutionType =
            document.getElementById("editInstitutionType");

        if (editInstitutionType && student.institutionType) {
            editInstitutionType.value = student.institutionType;
        }

        const editState = document.getElementById("editState");

        if (editState && student.state) {
            editState.value = student.state;
        }

        const editInstitution =
            document.getElementById("editInstitution");

        if (editInstitution) {
            editInstitution.value = student.institution || "";
        }

        const editStudentId =
            document.getElementById("editStudentId");

        if (editStudentId) {
            editStudentId.value = student.studentId || "";
        }

        const editCourse =
            document.getElementById("editCourse");

        if (editCourse && student.course) {
            editCourse.value = student.course;
        }

    } catch (error) {

        console.error(
            "Error loading profile page data:",
            error
        );

    }

}

if (
    document.getElementById("settingsAvatar") ||
    document.getElementById("profileAvatar") ||
    document.getElementById("profileFullName") ||
    document.getElementById("profileEmail") ||
    document.getElementById("profilePhone") ||
    document.getElementById("profileStudentType") ||
    document.getElementById("profileInstitution") ||
    document.getElementById("profileState") ||
    document.getElementById("profileStudentId") ||
    document.getElementById("profileProgram") ||
    document.getElementById("profileTopName") ||
    document.getElementById("profileRoleText") ||
    document.getElementById("profileHeaderAvatar") ||
    document.getElementById("editProfileForm")
) {

    firebase.auth().onAuthStateChanged(function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        loadProfileData();

    });

}

const editProfileBtn = document.getElementById("edit-profile-btn");
const profileEditPanel = document.getElementById("profileEditPanel");
const editProfileForm = document.getElementById("editProfileForm");
const cancelEditProfileBtn = document.getElementById("cancelEditProfileBtn");
const editProfileMessage = document.getElementById("editProfileMessage");

if (editProfileBtn && profileEditPanel) {

    editProfileBtn.addEventListener("click", function() {

        profileEditPanel.hidden = !profileEditPanel.hidden;

        if (!profileEditPanel.hidden) {
            loadProfileData();
            editProfileMessage.textContent = "";
        }

    });

}

if (cancelEditProfileBtn && profileEditPanel) {

    cancelEditProfileBtn.addEventListener("click", function() {

        profileEditPanel.hidden = true;
        editProfileMessage.textContent = "";

    });

}

if (editProfileForm) {

    editProfileForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const user = firebase.auth().currentUser;

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const fullName = document.getElementById("editFullName").value.trim();
        const phone = document.getElementById("editPhone").value.trim();
        const studentType = document.getElementById("editStudentType").value;
        const institutionType = document.getElementById("editInstitutionType").value;
        const state = document.getElementById("editState").value;
        const institution = document.getElementById("editInstitution").value.trim();
        const studentId = document.getElementById("editStudentId").value.trim();
        const course = document.getElementById("editCourse").value;

        const phonePattern = /^((\+234|0)[789][01]\d{8})$/;

        if (!fullName) {
            editProfileMessage.textContent = "Full Name is required.";
            editProfileMessage.style.color = "#dc2626";
            return;
        }

        if (!phonePattern.test(phone)) {
            editProfileMessage.textContent = "Please enter a valid Nigerian phone number.";
            editProfileMessage.style.color = "#dc2626";
            return;
        }

        if (!studentType || !institutionType || !state || !course) {
            editProfileMessage.textContent = "Please complete all required profile fields.";
            editProfileMessage.style.color = "#dc2626";
            return;
        }

        try {

            await db
                .collection("students")
                .doc(user.uid)
                .update({
                    fullName: fullName,
                    phone: phone,
                    studentType: studentType,
                    institutionType: institutionType,
                    state: state,
                    institution: institution,
                    studentId: studentId,
                    course: course
                });

            editProfileMessage.textContent = "Profile updated successfully.";
            editProfileMessage.style.color = "#16a34a";

            profileEditPanel.hidden = true;

            await loadProfileData();

        } catch (error) {

            console.error("Error updating profile:", error);
            editProfileMessage.textContent = "Unable to update your profile. Please try again.";
            editProfileMessage.style.color = "#dc2626";

        }

    });

}

// =========================
// LEARNING PAGE DATA
// =========================

if (
    document.getElementById("learningCourseTitle") ||
    document.getElementById("learningAvatar")
) {

    firebase.auth().onAuthStateChanged(async function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        try {

            const studentDoc = await db
                .collection("students")
                .doc(user.uid)
                .get();

            if (!studentDoc.exists) {
                return;
            }

            const student = studentDoc.data();

            const courseTitle =
                document.getElementById("learningCourseTitle");

            if (courseTitle) {
                courseTitle.textContent =
                    formatCourseName(student.course);
            }

            const avatar =
                document.getElementById("learningAvatar");

            if (avatar && student.fullName) {

                const nameParts =
                    student.fullName.trim().split(" ");

                let initials =
                    nameParts[0].charAt(0).toUpperCase();

                if (nameParts.length > 1) {
                    initials +=
                        nameParts[nameParts.length - 1]
                            .charAt(0)
                            .toUpperCase();
                }

                avatar.textContent = initials;
            }

        } catch (error) {

            console.error(
                "Error loading learning page data:",
                error
            );

        }

    });

}

// =========================
// OPEN LEARNING PAGE
// =========================

const continueLearningBtn =
    document.getElementById("continueLearningBtn");

if (continueLearningBtn) {

    continueLearningBtn.addEventListener("click", function() {

        window.location.href = "learning.html";

    });

}

// =========================
// OPEN LESSON 1
// =========================

const lessonButtons = document.querySelectorAll(".lesson-btn");

lessonButtons.forEach(function(button, index) {

    button.addEventListener("click", function() {

        if (index === 0) {
            window.location.href = "lesson.html";
        }

    });

});

// =========================
// COMPLETE LESSON 1
// =========================

if (document.getElementById("completeLessonBtn")) {

    firebase.auth().onAuthStateChanged(async function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const completeButton =
            document.getElementById("completeLessonBtn");

        const lessonMessage =
            document.getElementById("lessonMessage");

        completeButton.addEventListener("click", async function() {

            try {

                await db
                    .collection("students")
                    .doc(user.uid)
                    .update({
                        lesson1Completed: true
                    });

                completeButton.textContent =
                    "✅ Lesson Completed";

                completeButton.disabled = true;

                lessonMessage.textContent =
                    "Great job! You have completed Lesson 1.";

                lessonMessage.style.color = "#16a34a";

            } catch (error) {

                console.error(
                    "Error completing lesson:",
                    error
                );

                lessonMessage.textContent =
                    "Something went wrong. Please try again.";

                lessonMessage.style.color = "#dc2626";

            }

        });

    });

}

// =========================
// LEARNING PAGE PROGRESS
// =========================

if (document.getElementById("learningProgressBar")) {

    firebase.auth().onAuthStateChanged(async function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        try {

            const studentDoc = await db
                .collection("students")
                .doc(user.uid)
                .get();

            if (!studentDoc.exists) {
                return;
            }

            const student = studentDoc.data();

            const progressBar =
                document.getElementById("learningProgressBar");

            const progressText =
                document.getElementById("learningProgressText");

            // We currently have 5 lessons
            const totalLessons = 5;

            // Lesson 1 completion

let completedLessons = 0;

if (student.lesson1Completed) {
    completedLessons++;
}

if (student.lesson2Completed) {
    completedLessons++;
}

if (student.lesson3Completed) {
    completedLessons++;
}

if (student.lesson4Completed) {
    completedLessons++;
}

if (student.lesson5Completed) {
    completedLessons++;
}

            const progress =
                Math.round(
                    (completedLessons / totalLessons) * 100
                );

            if (progressBar) {
                progressBar.style.width = progress + "%";
            }

            if (progressText) {
                progressText.textContent =
                    progress + "% completed";
            }

        } catch (error) {

            console.error(
                "Error loading learning progress:",
                error
            );

        }

    });

}

// =========================
// LESSON STATUS
// =========================

if (document.getElementById("lesson1Button")) {

    firebase.auth().onAuthStateChanged(async function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        try {

            const studentDoc = await db
                .collection("students")
                .doc(user.uid)
                .get();

            if (!studentDoc.exists) {
                return;
            }

            const student = studentDoc.data();

            const lesson1Button =
                document.getElementById("lesson1Button");

            if (student.lesson1Completed) {

                lesson1Button.textContent =
                    "✅ Completed";

                lesson1Button.disabled = true;

            }

        } catch (error) {

            console.error(
                "Error checking lesson status:",
                error
            );

        }

    });

}

// =========================
// OPEN LESSON 2
// =========================

const lesson2Button =
    document.getElementById("lesson2Button");

if (lesson2Button) {

    lesson2Button.addEventListener("click", function() {

        window.location.href = "lesson2.html";

    });

}

// =========================
// COMPLETE LESSON 2
// =========================

if (document.getElementById("completeLesson2Btn")) {

    firebase.auth().onAuthStateChanged(async function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const completeButton =
            document.getElementById("completeLesson2Btn");

        const lessonMessage =
            document.getElementById("lesson2Message");

        completeButton.addEventListener("click", async function() {

            try {

                await db
                    .collection("students")
                    .doc(user.uid)
                    .update({
                        lesson2Completed: true
                    });

                completeButton.textContent =
                    "✅ Lesson Completed";

                completeButton.disabled = true;

                lessonMessage.textContent =
                    "Great job! You have completed Lesson 2.";

                lessonMessage.style.color = "#16a34a";

            } catch (error) {

                console.error(
                    "Error completing lesson 2:",
                    error
                );

                lessonMessage.textContent =
                    "Something went wrong. Please try again.";

                lessonMessage.style.color = "#dc2626";

            }

        });

    });

}

// =========================
// LESSON 2 STATUS
// =========================

if (document.getElementById("lesson2Button")) {

    firebase.auth().onAuthStateChanged(async function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        try {

            const studentDoc = await db
                .collection("students")
                .doc(user.uid)
                .get();

            if (!studentDoc.exists) {
                return;
            }

            const student = studentDoc.data();

            const lesson2Button =
                document.getElementById("lesson2Button");

            if (student.lesson2Completed) {

                lesson2Button.textContent =
                    "✅ Completed";

            }

        } catch (error) {

            console.error(
                "Error checking Lesson 2 status:",
                error
            );

        }

    });

}

// =========================
// COMPLETE LESSON 3
// =========================

if (document.getElementById("completeLesson3Btn")) {

    firebase.auth().onAuthStateChanged(async function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const completeButton =
            document.getElementById("completeLesson3Btn");

        const lessonMessage =
            document.getElementById("lesson3Message");

        completeButton.addEventListener("click", async function() {

            try {

                await db
                    .collection("students")
                    .doc(user.uid)
                    .update({
                        lesson3Completed: true
                    });

                completeButton.textContent =
                    "✅ Lesson Completed";

                completeButton.disabled = true;

                lessonMessage.textContent =
                    "Great job! You have completed Lesson 3.";

                lessonMessage.style.color = "#16a34a";

            } catch (error) {

                console.error(
                    "Error completing lesson 3:",
                    error
                );

                lessonMessage.textContent =
                    "Something went wrong. Please try again.";

                lessonMessage.style.color = "#dc2626";

            }

        });

    });

}

// =========================
// LESSON 3 STATUS
// =========================

if (document.getElementById("lesson3Button")) {

    firebase.auth().onAuthStateChanged(async function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        try {

            const studentDoc = await db
                .collection("students")
                .doc(user.uid)
                .get();

            if (!studentDoc.exists) {
                return;
            }

            const student = studentDoc.data();

            const lesson3Button =
                document.getElementById("lesson3Button");

            if (student.lesson3Completed) {

                lesson3Button.textContent =
                    "✅ Completed";

            }

        } catch (error) {

            console.error(
                "Error checking Lesson 3 status:",
                error
            );

        }

    });

}

// =========================
// OPEN LESSON 4
// =========================

const lesson4Button =
    document.getElementById("lesson4Button");

if (lesson4Button) {

    lesson4Button.addEventListener("click", function() {

        window.location.href = "lesson4.html";

    });

}

// =========================
// COMPLETE LESSON 4
// =========================

if (document.getElementById("completeLesson4Btn")) {

    firebase.auth().onAuthStateChanged(async function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const completeButton =
            document.getElementById("completeLesson4Btn");

        const lessonMessage =
            document.getElementById("lesson4Message");

        completeButton.addEventListener("click", async function() {

            try {

                await db
                    .collection("students")
                    .doc(user.uid)
                    .update({
                        lesson4Completed: true
                    });

                completeButton.textContent =
                    "✅ Lesson Completed";

                completeButton.disabled = true;

                lessonMessage.textContent =
                    "Great job! You have completed Lesson 4.";

                lessonMessage.style.color = "#16a34a";

            } catch (error) {

                console.error(
                    "Error completing lesson 4:",
                    error
                );

                lessonMessage.textContent =
                    "Something went wrong. Please try again.";

                lessonMessage.style.color = "#dc2626";

            }

        });

    });

}

// =========================
// LESSON 4 STATUS
// =========================

if (document.getElementById("lesson4Button")) {

    firebase.auth().onAuthStateChanged(async function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        try {

            const studentDoc = await db
                .collection("students")
                .doc(user.uid)
                .get();

            if (!studentDoc.exists) {
                return;
            }

            const student = studentDoc.data();

            const lesson4Button =
                document.getElementById("lesson4Button");

            if (student.lesson4Completed) {

                lesson4Button.textContent =
                    "✅ Completed";

            }

        } catch (error) {

            console.error(
                "Error checking Lesson 4 status:",
                error
            );

        }

    });

}

// =========================
// OPEN LESSON 5
// =========================

const lesson5Button =
    document.getElementById("lesson5Button");

if (lesson5Button) {

    lesson5Button.addEventListener("click", function() {

        window.location.href = "lesson5.html";

    });

}

// =========================
// COMPLETE LESSON 5
// =========================

if (document.getElementById("completeLesson5Btn")) {

    firebase.auth().onAuthStateChanged(async function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const completeButton =
            document.getElementById("completeLesson5Btn");

        const lessonMessage =
            document.getElementById("lesson5Message");

        completeButton.addEventListener("click", async function() {

            try {

                await db
                    .collection("students")
                    .doc(user.uid)
                    .update({
                        lesson5Completed: true
                    });

                completeButton.textContent =
                    "🎉 Course Completed";

                completeButton.disabled = true;

                lessonMessage.textContent =
                    "Congratulations! You have completed the course.";

                lessonMessage.style.color = "#16a34a";

            } catch (error) {

                console.error(
                    "Error completing lesson 5:",
                    error
                );

                lessonMessage.textContent =
                    "Something went wrong. Please try again.";

                lessonMessage.style.color = "#dc2626";

            }

        });

    });

}

// =========================
// LESSON 5 STATUS
// =========================

if (document.getElementById("lesson5Button")) {

    firebase.auth().onAuthStateChanged(async function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        try {

            const studentDoc = await db
                .collection("students")
                .doc(user.uid)
                .get();

            if (!studentDoc.exists) {
                return;
            }

            const student = studentDoc.data();

            const lesson5Button =
                document.getElementById("lesson5Button");

            if (student.lesson5Completed) {

                lesson5Button.textContent =
                    "✅ Completed";

            }

        } catch (error) {

            console.error(
                "Error checking Lesson 5 status:",
                error
            );

        }

    });

}

// =========================
// DASHBOARD PROGRESS
// =========================

if (document.getElementById("dashboardProgress")) {

    firebase.auth().onAuthStateChanged(async function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        try {

            const studentDoc = await db
                .collection("students")
                .doc(user.uid)
                .get();

            if (!studentDoc.exists) {
                return;
            }

            const student = studentDoc.data();

            const totalLessons = 5;

            let completedLessons = 0;

            if (student.lesson1Completed) {
                completedLessons++;
            }

            if (student.lesson2Completed) {
                completedLessons++;
            }

            if (student.lesson3Completed) {
                completedLessons++;
            }

            if (student.lesson4Completed) {
                completedLessons++;
            }

            if (student.lesson5Completed) {
                completedLessons++;
            }

            const progress =
                Math.round(
                    (completedLessons / totalLessons) * 100
                );

            document.getElementById("dashboardProgress")
                .textContent = progress + "%";

        } catch (error) {

            console.error(
                "Error loading dashboard progress:",
                error
            );

        }

    });

}

// =========================
// PROFILE PAGE
// =========================

if (document.getElementById("profileFullName")) {

    firebase.auth().onAuthStateChanged(async function(user) {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        try {

            const studentDoc = await db
                .collection("students")
                .doc(user.uid)
                .get();

            if (!studentDoc.exists) {
                console.log("Student profile not found.");
                return;
            }

            const student = studentDoc.data();


            // Full name
            document.getElementById("profileTopName").textContent =
                student.fullName || "Not provided";

            document.getElementById("profileFullName").textContent =
                student.fullName || "Not provided";


            // Email
            document.getElementById("profileEmail").textContent =
                student.email || user.email || "Not provided";


            // Phone
            document.getElementById("profilePhone").textContent =
                student.phone || "Not provided";


            // Student type
            document.getElementById("profileStudentType").textContent =
                formatStudentType(student.studentType);


            // Institution
            document.getElementById("profileInstitution").textContent =
                student.institution || "Not provided";


            // State
            document.getElementById("profileState").textContent =
                student.state || "Not provided";


            // Student ID
            document.getElementById("profileStudentId").textContent =
                student.studentId || "Not provided";


            // Program
            document.getElementById("profileProgram").textContent =
                formatCourseName(student.course);


            // Create initials
            const nameParts =
                student.fullName.trim().split(" ");

            let initials =
                nameParts[0].charAt(0).toUpperCase();

            if (nameParts.length > 1) {

                initials +=
                    nameParts[nameParts.length - 1]
                        .charAt(0)
                        .toUpperCase();

            }


            // Header avatar
            const headerAvatar =
                document.getElementById("profileHeaderAvatar");

            if (headerAvatar) {
                headerAvatar.textContent = initials;
            }


            // Profile avatar
            const profileAvatar =
                document.getElementById("profileAvatar");

            if (profileAvatar) {
                profileAvatar.textContent = initials;
            }


        } catch (error) {

            console.error(
                "Error loading profile:",
                error
            );

        }

    });

}

// =========================
// UPDATE PASSWORD
// =========================

const updatePasswordBtn =
    document.getElementById("updatePasswordBtn");

if (updatePasswordBtn) {

    updatePasswordBtn.addEventListener("click", async function() {

        const currentPassword =
            document.getElementById("currentPassword").value;

        const newPassword =
            document.getElementById("newPassword").value;

        const confirmNewPassword =
            document.getElementById("confirmNewPassword").value;

        const passwordMessage =
            document.getElementById("passwordMessage");

        const user =
            firebase.auth().currentUser;


        // Check if user is logged in

        if (!user) {

            passwordMessage.textContent =
                "You must be logged in.";

            passwordMessage.style.color =
                "red";

            return;
        }


        // Check fields

        if (
            currentPassword === "" ||
            newPassword === "" ||
            confirmNewPassword === ""
        ) {

            passwordMessage.textContent =
                "Please fill in all password fields.";

            passwordMessage.style.color =
                "red";

            return;
        }


        // Check password length

        if (newPassword.length < 6) {

            passwordMessage.textContent =
                "New password must be at least 6 characters.";

            passwordMessage.style.color =
                "red";

            return;
        }


        // Check passwords match

        if (newPassword !== confirmNewPassword) {

            passwordMessage.textContent =
                "New passwords do not match.";

            passwordMessage.style.color =
                "red";

            return;
        }


        try {

            // Re-authenticate the user

            const credential =
                firebase.auth.EmailAuthProvider.credential(
                    user.email,
                    currentPassword
                );


            await user.reauthenticateWithCredential(
                credential
            );


            // Update password

            await user.updatePassword(
                newPassword
            );


            passwordMessage.textContent =
                "Password updated successfully! 🎉";

            passwordMessage.style.color =
                "green";


            // Clear the fields

            document.getElementById(
                "currentPassword"
            ).value = "";

            document.getElementById(
                "newPassword"
            ).value = "";

            document.getElementById(
                "confirmNewPassword"
            ).value = "";


        } catch (error) {

            console.error(
                "Password update error:",
                error
            );


            if (
                error.code === "auth/wrong-password" ||
                error.code === "auth/invalid-credential"
            ) {

                passwordMessage.textContent =
                    "Your current password is incorrect.";

            } else {

                passwordMessage.textContent =
                    "Unable to update password. Please try again.";

            }

            passwordMessage.style.color =
                "red";

        }

    });

}