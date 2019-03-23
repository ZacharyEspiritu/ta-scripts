# protected-student-directories

This directory contains scripts helpful for managing and creating "protected student directories" in your `/course` directory.

### Background

Several courses create per-student directories in a `/course/csXXXX/student` directory that are accessible only for that particular student. This is done using [Unix ACLs](https://wiki.archlinux.org/index.php/Access_Control_Lists), which allow for more fine-grained permissions on files and directories in the department filesystem.

There's a couple reasons you might want to do this. For example, CSCI1660 does this to provide each student unique versions of support files for each project. The general set-up for `/course/cs1660/student` directories is that the per-student directory (for example, `/course/cs1660/student/zespirit`) is the one that contains the ACL that allows student access, while nested directories and files simply contain world-readable and world-executable permissions. This lets the student access the files in their personal directory without modifying their contents.

You might also want to give students extra disk space by sharing some in your course's `/course` directory---you could create a per-student directory using the system described above where the student has write access. (One thing to note is that since the quota is shared across the entire `/course/csXXXX` directory, a student could execute a denial-of-service their directory by filling it up with large files to the point where no students or TAs are able to write to files in the course directory.)

Finally, in some cases you might want to have ACLs "inherited" by newly created files or directories in the directory with an ACL. The default behavior of the ACLs created by the create-student-directories.sh script is to only apply the permission to the student directory that was originally created (see [this line](https://github.com/ZacharyEspiritu/ta-scripts/blob/76ed51165f0137ee68da8f4e5b464cdc305599e9/protected-student-directories/create-student-directories.sh#L21)):

```bash
setfacl -m "u:$1:rx" $STUDENT_DIR
```

You can add the `-d` flag, which will set "default" permisisons:

```bash
setfacl -dm "u:$1:rx" $STUDENT_DIR
```

This means that all new files or directories created inside of `$STUDENT_DIR` will automatically inherit the ACL of `$STUDENT_DIR`.

### Scripts

* [create-student-directories.sh](https://github.com/ZacharyEspiritu/ta-scripts/blob/master/protected-student-directories/create-student-directories.sh) - Consumes a list of CS logins and creates a directory in `/course/csXXXX/student` directory such that the student is the only one able to access that directory. (The script can be modified to have different permissions. For example, the script only sets the permissions such that the student can access the directory but not write to it, but this could be changed to a directory where the student is able to modify their own directory, etc.)
