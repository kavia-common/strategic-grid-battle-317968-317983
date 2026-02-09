import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders auth screen", () => {
  render(<App />);
  expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
});
