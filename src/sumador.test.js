import {sumar, restar, multiplicar} from "./sumador.js";

describe("Sumar", () => {
  it("deberia sumar dos numeros", () => {
    expect(sumar(3, 2)).toEqual(5);
  });
});

describe("Restando", () => {
  it("deberia restar dos numeros", () => {
    expect(restar(3, 2)).toEqual(1);
  });
});

describe("Multiplicando", () => {
  it("deberia multiplicar dos numeros", () => {
    expect(multiplicar(3, 2)).toEqual(6);
  });
});

