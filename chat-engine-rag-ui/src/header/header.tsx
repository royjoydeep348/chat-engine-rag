import { ModeToggle } from "../components/mode-toggle";


function Header() {
  return (
    <div
      className="mb-0 align-top"
      style={{
        width: "96.5%",
        margin: "5px",
      }}
    >
          <div className="flex mb-4 space-y-5 items-end w-screen align-top">
            <div className="w-1/5 h-12">
              <ModeToggle />
            </div>
            <div className="w-1/5 h-12"> </div>
            <div className="w-1/5 h-12"> </div>
            <div className="w-1/5 h-12"></div>
            <div className="w-1/5 h-12">
            </div>
          </div>
    </div>
  );
}

export default Header;
