import React, { useEffect, useState } from 'react';
import { Input } from "baseui/input";
import { Button } from "baseui/button";

function Home() {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    console.log("Submitting with value", value);
  };

  return (
    <>
      <Input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Youtube URL"
        clearOnEscape
      />
      <Button onClick={handleSubmit}>Submit</Button>
    </>
  );
}

export default Home;