# ta-scripts
Scripts that are helpful for various TA responsibilities, written mainly for the Brown CS ecosystem.

Most scripts include various tips or documentation on how to best use the scripts, which you can find in their associated `README`s or as header comments within the script itself.

## Table of Contents

* [demos](demos) — Scripts related to running clean and professional demonstrations (for example, during lecture or for a help session) for students.
* [grading-infrastructure](grading-infrastructure) — Things to use when grading student work. This includes Bash scripts to augment the classic grading systems used in the Brown CS infrastructure (`grade`, Evalpig, GradeGlutton, etc.); it also contains a newer collection of Google Apps Scripts that form their own grading infrastructure (GRBL) that lives in Google Drive as opposed to the shared UNIX filesystem.
* [labs](labs) — Scripts related to the management of labs / sections / etc.
* [override-codes](override-codes) — Scripts helpful in terms of the distribution of override codes (as used on cab.brown.edu).
* [protected-student-directories](protected-student-directories) — Scripts helpful for managing and creating "protected student directories" in your `/course` directory.
* [security](security) — Scripts related to keeping things secure.
* [student-id-management](student-id-management) — Scripts relevant to the management of student identifiers (email addresses, CS logins, Banner IDs, etc.). Note that this category doesn't include anonymization of students (which is more relevant in a grading-related topic).

## Other Resources

* [ta-scripts Wiki](https://github.com/ZacharyEspiritu/ta-scripts/wiki) — Various notes on using the scripts / department systems.
* [FUSE Installation Instructions](https://github.com/sandyharvie/FUSE-Installation-Instructions/wiki/FUSE-Installation-Instructions) — A guide by [@sandyharvie](https://github.com/sandyharvie) on using `sshfs` to remotely edit files on the department filesystem; you might find this a more convenient and smooth alternative to `ssh` or programs like Cyberduck.

## Helpful Programs

* [pandoc](https://pandoc.org/) — A universal document converter. Imagine being able to write all of your handouts (or personal homeworks) in Markdown; then simply running a command that generates a LaTeX PDF from that Markdown file. You'd never have to touch raw LaTeX again! (Pandoc does all that for you, and more.)
* [proselint](http://proselint.com/) — A linter for prose. Not a grammar checker, but rather "a tool so precise that it becomes possible to unquestioningly adopt its recommendations". Very helpful when writing handouts or checking your own writing.
