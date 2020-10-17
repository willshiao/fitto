import React, { useState } from 'react';
import { Input } from "baseui/input";
import { Button } from "baseui/button";
import { Redirect } from "react-router-dom";

function Home() {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    console.log("Submitting with value", value);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Redirect
        push
        to={{
          pathname: "/session",
          state: { videoUrl: value }
        }}
      />
    );
  }

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