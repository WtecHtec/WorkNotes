package main

import (
	"fmt"
	"os"
)

func readMaze(pathFile string) ([][]int, bool) {
	file, err := os.Open(pathFile)
	if err != nil {
		return nil, false
	}
	defer file.Close()
	var row, col int
	fmt.Fscanf(file, "%d %d", &row, &col)
	mazes := make([][]int, row)
	for i := range mazes {
		mazes[i] = make([]int, col)
		for j := range mazes[i] {
			fmt.Fscanf(file, "%d", &mazes[i][j])
		}
	}
	return mazes, true
}

type point struct {
	i, j int
}

var dirs = [4]point{
	{-1, 0},
	{0, -1},
	{1, 0},
	{0, 1},
}

func (p *point) add(r point) point {
	return point{p.i + r.i, p.j + r.j}
}

func (p *point) at(gird [][]int) (int, bool) {
	if p.i < 0 || p.i >= len(gird) {
		return 0, false
	}
	if p.j < 0 || p.j >= len(gird[p.i]) {
		return 0, false
	}
	return gird[p.i][p.j], true
}
func walk(maze [][]int, start, end point) [][]int {
	steps := make([][]int, len(maze))
	for i := range maze {
		steps[i] = make([]int, len(maze[i]))
	}
	Q := []point{start}
	for len(Q) > 0 {
		cur := Q[0]
		Q = Q[1:]
		if cur == end {
			break
		}
		for _, dir := range dirs {
			next := cur.add(dir)
			value, ok := next.at(maze)
			if !ok || value == 1 {
				continue
			}
			nvalue, nok := next.at(steps)
			if !nok || nvalue != 0 {
				continue
			}
			if next == start {
				continue
			}
			curStep, _ := cur.at(steps)
			steps[next.i][next.j] = curStep + 1
			Q = append(Q, next)
		}
	}
	return steps
}
func stepsPlint(step [][]int) {
	for _, value := range step {
		fmt.Printf("%3d\n", value)
	}
}
func main() {
	// 读取文件
	mazes, _ := readMaze("maze/maze.in")
	// 计算步数
	steps := walk(mazes, point{0, 0}, point{len(mazes) - 1, len(mazes[0]) - 1})
	// 打印
	stepsPlint(steps)
}
