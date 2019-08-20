# ta-scripts
Scripts that are helpful for various TA responsibilities, written mainly for the Brown CS ecosystem.

Most scripts include various tips or documentation on how to best use the scripts, which you can find in their associated `README`s or as header comments within the script itself.

## Table of Contents

* [demos](demos) — Scripts related to running clean and professional demonstrations (for example, during lecture or for a help session) for students.
* [grading-infrastructure](grading-infrastructure) — Things to use when grading student work. This includes Bash scripts to augment the classic grading systems used in the Brown CS infrastructure (`grade`, Evalpig, GradeGlutton, etc.); it also contains a newer collection of Google Apps Scripts that form their own grading infrastructure (GRBL) that lives in Google Drive as opposed to the shared UNIX filesystem.
* [override-codes](override-codes) — Scripts helpful in terms of the distribution of override codes (as used on cab.brown.edu).
* [protected-student-directories](protected-student-directories) — Scripts helpful for managing and creating "protected student directories" in your `/course` directory.
* [security](security) — Scripts related to keeping things secure.
* [student-id-management](student-id-management) — Scripts relevant to the management of student identifiers (email addresses, CS logins, Banner IDs, etc.). Note that this category doesn't include anonymization of students (which is more relevant in a grading-related topic).

## Other Resources

* [FUSE Installation Instructions](https://github.com/sandyharvie/FUSE-Installation-Instructions/wiki/FUSE-Installation-Instructions) — A guide by [@sandyharvie](https://github.com/sandyharvie) on using `sshfs` to remotely edit files on the department filesystem; you might find this a more convenient and smooth alternative to `ssh` or programs like Cyberduck.
