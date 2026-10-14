'use client';

import { Button } from '@mui/material';
import { useState } from 'react';

type QuestionProps = {
  question?: string;
  answer?: string;
};

function Question(props: QuestionProps) {
  function handleClick() {
    console.log('Clicked!');
    setVisible(!visible);
  }

  const [visible, setVisible] = useState(false);

  return (
    <div>
      <h2 className="text-2xl">
        <Button variant="contained" onClick={handleClick}>
          {visible ? 'Close' : 'Open'}
        </Button>
        {props.question}
      </h2>
      {visible && <p>{props.answer}</p>}
    </div>
  );
}

export default function Page() {
  return (
    <div className="m-auto mt-16 flex w-128 flex-col gap-8">
      <h1 className="text-4xl">Frequently Asked Questions</h1>
      <Question
        question="Do we steal your personal information?"
        answer="Noo, we don't, we're not Facebook"
      />
      <Question
        question="What is the best flavor of ice cream?"
        answer="Mint chocolate chip"
      />
      <Question
        question="Is Trends better than UTD Grades?"
        answer="Yes. Nebula Labs on top!!!"
      />
    </div>
  );
}
