import "./../app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "./header/header";
import ChatHome from "./chat/chat-home";


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Header />
      <ChatHome />
    </ThemeProvider>
  );
}

export default App;
