# Puzzle-N Solver: Backtracking and A* Search

## Overview

This project is an academic work for the *Algorithm Analysis* course at Tecnológico de Costa Rica. It was developed by **Steven Sequeira** and **Josue Echeverria**.

The project focuses on solving the **N-Puzzle** problem — a classic single-player game that consists of a board with `N×N` positions containing numbered tiles (from 1 to `N^2 - 1`) and an empty space. The goal is to rearrange the tiles to match a target configuration by sliding tiles into the empty space.

We implemented two fundamental algorithms for solving this problem:

- **Backtracking:** An exhaustive search strategy that explores all possible moves.
- **A* search algorithm:** A heuristic search using the number of misplaced tiles as the heuristic and Manhattan distance as the cost estimator.

## Features

- Supports board sizes from `3×3` up to `20×20` (user selectable).
- Allows users to choose between at least six different image themes for the tiles.
- Generates random puzzles (including the detection of unsolvable configurations).
- Displays step-by-step visualization of the algorithm's solution, including:
  - The open and closed lists at each iteration (for A*).
  - The expanded nodes and evaluation function values.
- Animation showing the sequence of moves required to reach the goal.
- Text description of the solution path, e.g., “move tile 7 to the right”.

## Implementation

- Developed entirely in **JavaScript**, with the algorithms (Backtracking and A*) fully implemented from scratch.
- Utilizes HTML for the user interface, importing JavaScript files dynamically.
- Makes use of data structures and classes to represent the search space and nodes.
- All code is well-documented using **jsDoc** comments for each function and class.

## How to Run

1. Open the `index.html` file in your web browser.
2. Select the desired board size and tile image theme.
3. Click to generate a random puzzle.
4. Choose whether to solve using Backtracking or A*.
5. Watch the algorithm run, showing the solution sequence and animation.

> ⚠ **Note:** Solving large boards (e.g., `20×20`) with backtracking may consume significant resources or become infeasible; the demonstration focuses on correctness rather than speed.

## Authors

- **Steven Sequeira**
- **Josue Echeverria**

## License

This project is intended for academic purposes.  
All algorithms are original implementations by the authors.

