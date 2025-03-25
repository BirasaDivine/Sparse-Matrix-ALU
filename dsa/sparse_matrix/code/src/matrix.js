const fs = require("fs");
const path = require("path");

class SparseMatrix {
  constructor(matrixFilePathOrNumRows, numCols) {
    this.elements = new Map();

    if (typeof matrixFilePathOrNumRows === "string") {
      this.loadMatrix(matrixFilePathOrNumRows);
    } else {
      this.rows = matrixFilePathOrNumRows;
      this.cols = numCols;
    }
  }

  loadMatrix(matrixFilePath) {
    const content = fs.readFileSync(matrixFilePath, "utf-8");
    const lines = content.trim().split("\n");

    this.rows = parseInt(lines[0].split("=")[1]);
    this.cols = parseInt(lines[1].split("=")[1]);

    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const [row, col, value] = line.slice(1, -1).split(",").map(Number);
        this.setElement(row, col, value);
      }
    }
  }

  getElement(currRow, currCol) {
    return this.elements.get(`${currRow},${currCol}`) || 0;
  }

  setElement(currRow, currCol, value) {
    if (value !== 0) {
      this.elements.set(`${currRow},${currCol}`, value);
    } else {
      this.elements.delete(`${currRow},${currCol}`);
    }
  }

  add(other) {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error("Matrices dimensions do not match for addition");
    }

    const result = new SparseMatrix(this.rows, this.cols);

    for (const [key, value] of this.elements) {
      result.elements.set(key, value);
    }

    for (const [key, value] of other.elements) {
      const [row, col] = key.split(",").map(Number);
      const newValue = result.getElement(row, col) + value;
      result.setElement(row, col, newValue);
    }

    return result;
  }

  subtract(other) {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error("Matrices dimensions do not match for subtraction");
    }

    const result = new SparseMatrix(this.rows, this.cols);

    for (const [key, value] of this.elements) {
      result.elements.set(key, value);
    }

    for (const [key, value] of other.elements) {
      const [row, col] = key.split(",").map(Number);
      const newValue = result.getElement(row, col) - value;
      result.setElement(row, col, newValue);
    }

    return result;
  }

  multiply(other) {
    if (this.cols !== other.rows) {
      throw new Error("Matrices dimensions do not match for multiplication");
    }

    const result = new SparseMatrix(this.rows, other.cols);

    for (const [key1, value1] of this.elements) {
      const [row1, col1] = key1.split(",").map(Number);
      for (const [key2, value2] of other.elements) {
        const [row2, col2] = key2.split(",").map(Number);
        if (col1 === row2) {
          const newValue = result.getElement(row1, col2) + value1 * value2;
          result.setElement(row1, col2, newValue);
        }
      }
    }

    return result;
  }

  saveResult(resultFilePath) {
    let content = `rows=${this.rows}\n`;
    content += `cols=${this.cols}\n`;
    for (const [key, value] of this.elements) {
      const [row, col] = key.split(",");
      content += `(${row}, ${col}, ${value})\n`;
    }
    fs.writeFileSync(resultFilePath, content);
  }
}

function main() {
  const firstmatrixFilePath =
    __dirname + "/../../sample_inputs/matrixfile1.txt";
  const secondmatrixFilePath =
    __dirname + "/../../sample_inputs/matrixfile3.txt";

  const matrix1 = new SparseMatrix(firstmatrixFilePath);
  const matrix2 = new SparseMatrix(secondmatrixFilePath);

  const resultAdd = matrix1.add(matrix2);
  const resultSub = matrix1.subtract(matrix2);
  // const resultMult = matrix1.multiply(matrix2);

  const outputAddPath = path.resolve(
    __dirname,
    "../../sample_results/addition_result.txt"
  );
  const outputSubPath = path.resolve(
    __dirname,
    "../../sample_results/subtraction_result.txt"
  );
  const outputMultPath = path.resolve(
    __dirname,
    "../../sample_results/multiplication_result.txt"
  );

  resultAdd.saveResult(outputAddPath);
  resultSub.saveResult(outputSubPath);
  // resultMult.saveResult(outputMultPath);

  console.log("Processed successfully. Output saved to sample_results folder.");
}

main();
