import {
  Alert,
  Button,
  Collapse,
  Rating,
  Snackbar,
  SnackbarContent,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

export default function FeedbackPopup() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  //Open after 60 seconds if not already asked/close (based on localStorage)
  useEffect(() => {
    const previousFeedback = localStorage.getItem('feedback');
    let ask = previousFeedback === null;
    if (previousFeedback !== null) {
      const parsedFeedback = JSON.parse(previousFeedback);
      if (
        parsedFeedback !== null &&
        parsedFeedback.value !== 'closed' &&
        parsedFeedback.value !== 'submitted'
      ) {
        ask = true;
      }
    }
    if (ask) {
      const timer = setTimeout(() => {
        setFeedbackOpen(true);
      }, 1000 * 60); //60 seconds
      return () => clearTimeout(timer);
    }
  }, []);
  const cacheIndexFeedback = 0; //Increment this to request feedback from all users on next deployment

  //Successfully submitted control
  const [feedbackSuccessOpen, setFeedbackSuccessOpen] = useState(false);
  function handleFeedbackSuccessClose(
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) {
    if (reason === 'clickaway') {
      return;
    }
    setFeedbackSuccessOpen(false);
  }

  //Error submitting control
  const [feedbackErrorOpen, setFeedbackErrorOpen] = useState(false);
  function handlefeedbackErrorClose(
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) {
    if (reason === 'clickaway') {
      return;
    }
    setFeedbackErrorOpen(false);
  }

  //Survey answer storage
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackExtra, setFeedbackExtra] = useState('');

  //Send response to API, store result in localStorage
  function sendFeedback() {
    return new Promise<void>((resolve, reject) => {
      fetch('/api/postFeedback', {
        method: 'POST',
        body: JSON.stringify({
          rating: feedbackRating,
          extra: feedbackExtra,
          env: process.env.NEXT_PUBLIC_VERCEL_ENV,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message !== 'success') {
            throw new Error(data.message);
          }
          localStorage.setItem(
            'feedback',
            JSON.stringify({
              value: 'submitted',
              cacheIndex: cacheIndexFeedback,
            }),
          );
          resolve();
        })
        .catch((error) => {
          localStorage.setItem(
            'feedback',
            JSON.stringify({
              value: 'error',
              cacheIndex: cacheIndexFeedback,
            }),
          );
          console.error('Feedback', error);
          reject();
        });
    });
  }

  return (
    <>
      <Snackbar open={feedbackOpen}>
        <SnackbarContent
          className="bg-white dark:bg-haiti text-haiti dark:text-white"
          sx={{
            '& .MuiSnackbarContent-message ': {
              width: '100%',
            },
          }}
          message={
            <div className="flex flex-col items-center gap-2">
              <p className="text-base self-start">
                How would you rate your experience with Trends?
              </p>
              <Rating
                value={feedbackRating}
                size="large"
                onChange={(event, newValue) => {
                  setFeedbackRating(newValue);
                }}
              />
              <Collapse in={feedbackRating !== null} className="w-full">
                <div className="w-full flex flex-col items-center gap-2">
                  <p className="text-base self-start">
                    Do you have anything else you&apos;d like to add?
                  </p>
                  <TextField
                    className="w-full"
                    multiline
                    value={feedbackExtra}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setFeedbackExtra(event.target.value);
                    }}
                  />
                  <p className="text-xs">
                    Visit our{' '}
                    <a
                      className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                      href="https://github.com/UTDNebula/utd-trends"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      GitHub
                    </a>{' '}
                    for more detailed issue reporting.
                  </p>
                </div>
              </Collapse>
              <div className="self-end flex gap-2">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setFeedbackOpen(false);
                    localStorage.setItem(
                      'feedback',
                      JSON.stringify({
                        value: 'closed',
                        cacheIndex: cacheIndexFeedback,
                      }),
                    );
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="[&:not(:hover):not(:disabled)]:bg-royal"
                  size="small"
                  variant="contained"
                  disabled={feedbackRating === null}
                  onClick={() => {
                    setFeedbackOpen(false);
                    sendFeedback()
                      .then(() => {
                        setFeedbackSuccessOpen(true);
                      })
                      .catch(() => {
                        setFeedbackErrorOpen(true);
                      });
                  }}
                >
                  Submit
                </Button>
              </div>
            </div>
          }
        />
      </Snackbar>
      <Snackbar
        open={feedbackSuccessOpen}
        autoHideDuration={6000}
        onClose={handleFeedbackSuccessClose}
      >
        <Alert
          onClose={handleFeedbackSuccessClose}
          severity="success"
          sx={{ width: '100%' }}
        >
          Feedback submitted. Thank you!
        </Alert>
      </Snackbar>
      <Snackbar
        open={feedbackErrorOpen}
        autoHideDuration={6000}
        onClose={handlefeedbackErrorClose}
      >
        <Alert
          onClose={handlefeedbackErrorClose}
          severity="error"
          sx={{ width: '100%' }}
        >
          There was an error submitting your response. Please try again later.
        </Alert>
      </Snackbar>
    </>
  );
}
