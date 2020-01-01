# `pandoc`

This directory contains a guide for (and examples for) using [Pandoc][pandoc],
a document converter between Markdown and LaTeX PDFs. Alternatively, this guide
attempts to make the case for why you should use [Pandoc][pandoc] in your
workflow (and minimize the amount of LaTeX code you have to write by hand in
the future).

## The Pitch for `pandoc`

If you've taken any proof-writing class at Brown (or any upper-level CS course,
for that matter), you've most likely had to deal with writing
[LaTeX][latex-project] by hand.

LaTeX is certainly valuable to learn. It looks much better than anything you'll
get from a WYSIWYG editor, you'll need it if you want anyone to read your
mathematical statements in the future, and you'll almost certainly need it if
you want to write an academic paper in CS. All of those positives are generally
overlooked by the fact that LaTeX is...well, inconvenient to use.

### Comparison

Paraphrased from [Daniel Allington][allington]. [LaTeX][latex-project]'s website
states that:

> LaTeX is not a word processor! Instead, LaTeX encourages authors not to worry
> too much about the appearance of their documents but to concentrate on getting
> the right content.

In reality, in order to get started with a LaTeX document, you'll need a
`\documentclass` declaration and throw in some somewhat bulky syntax for
`\title`, `\author`, and `\date` tags (never mind that writing `\title` doesn't
actually put the title in the document and you'll need to write `\maketitle` or
one of its derivatives to use it). Want to write a bulleted list? You'll also
need to `\begin` an `itemize` environment—or maybe an `enumerate` environment?.
Eventually, your whole document is a potpourri of `\begin`s, `\end`s,
backslashes, brackets, and we haven't even typeset a single math equation by
lunch.

Why should we have to worry about all of this every time we write up a homework?

```latex
\documentclass[12pt,letterpaper]{article}
\usepackage{amsmath}
\usepackage{geometry}
... % repeat \usepackage 7 more times as well as header housekeeping
\begin{document}
\begin{problem}
Here is our proof:
\begin{proof}
The equation \( x^2 + y^2 = z^2 \) proves everything.
\end{proof}
\end{problem}
\end{document}
```

What if we could just write this _and_ still get a beautiful LaTeX-ed PDF?

```markdown
# Problem 1

Here is our proof.

Proof.

: The equation $x^2 + y^2 = z^2$ proves everything.
```

[Pandoc][pandoc] lets you do that.

## Usage Guide

### Quick Start

1. You'll need to install [Pandoc][pandoc] on your local machine. (If you're
using a department machine, it's already installed!)

2. You'll need a Pandoc template for your generated LaTeX PDF.
[CSCI0220][cs22]'s LaTeX template is useful for a lot of courses, so we've
created a `template.latex` file containing the template code for that along with
some Pandoc-related housekeeping—download that file to your machine.

3. Create a `*.md` file with the content you'd like to add to your PDF. See the
`example.md` file for an example.

4. Run the following command:

    ```bash
    pandoc example.md --template template.tex -o output.pdf
    ```

    which will compile your `example.md` file into the `output.pdf` file using
    the LaTeX template `template.tex`. See the provided `output.pdf` file here
    for an example of how things turn out!

### Easier Proofs and Theorems

Pandoc doesn't immediately support the `lemma` and `proof` environments that
are used frequently in proof-writing courses such as [CSCI0220][cs22]. You can
approximate them with Markdown formatting:

```markdown
_Proof._ The equation $x^2 + y^2 = z^2$ is the proof. \qed
```

However, if you want the compiled LaTeX to use the actual `lemma` and `proof`
environments from the [`amsthm`][amsthm] environment, you can use
[Sarah Lim's pandoc-theorem][pandoc-theorem], which automatically converts the
following syntax into various [`amsthm`][amsthm] environments:

```markdown
Proof.

:   The equation $x^2 + y^2 = z^2$ is the proof. \qed
```

See the [pandoc-theorem][pandoc-theorem] repository for more information.

[allington]: http://www.danielallington.net/2016/09/the-latex-fetish/
[amsthm]: https://www.ctan.org/pkg/amsthm
[cs22]: http://cs.brown.edu/courses/cs022/
[latex-project]: https://www.latex-project.org/
[pandoc]: https://pandoc.org/index.html
[pandoc-theorem]: https://github.com/sliminality/pandoc-theorem
