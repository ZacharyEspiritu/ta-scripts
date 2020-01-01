---
course: "CSCI0220"
semester: "Spring 2020"
hw_number: 1
custom_commands:
  - name: \N
    code: \mathbb{N}
  - name: \Z
    code: \mathbb{Z}
---

# Problem 1

Answer to Problem 1 goes here.

# Problem 2

This is the answer to another question!

This is the second paragraph of another question!

- Maybe it has...

- ...multiple parts...

    Proof.

    : Because I said so.

- ...to answer.

# Problem 3

We can even do things like write math notation in our `.md` files:

Theorem (Fermat's Little).

: If $p$ is a prime number, then for any integer $a$, the number
  $$a^p - a$$ is an integer multiple of $p$.

Or create some interesting tables:

| Header 1 | Header 2 | Header 3 |
|:---------|:--------:|---------:|
| Left     | Center   | Right    |
| Wow,     | so       | easy!    |

And, if you _really_ need to, you can include raw \LaTeX{} as part of your
document:

\begin{proof}
  This proves that we can use raw \LaTeX{} while still writing the
  \textit{majority} of our documents in \texttt{.md} files.
\end{proof}
