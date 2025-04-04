import React, { useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { logger } from '../../../../core/utils/logger';

const CHATFLOW_ID = 'b98e2d5b-00ac-4ee0-bbd9-e18eae3f9670';

export function BugReporter({
  selectedElement,
  elementInfo,
  onClose,
  contentfulEnvironment,
  contentfulSpaceId,
  fullName,
  email,
  pageUrl,
  pageId
}) {
  const [bugDescription, setBugDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!selectedElement) {
      setBugDescription('');
      setError(null);
    }
  }, [selectedElement]);

  const handleClose = useCallback(() => {
    setBugDescription('');
    setError(null);
    onClose?.();
  }, [onClose]);

  const handleSubmitBug = async () => {
    if (!bugDescription.trim()) {
      setError('Please enter a bug description');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const message = {
        type: 'SUBMIT_BUG_REPORT',
        payload: {
          chatflowId: CHATFLOW_ID,
          data: {
            question: bugDescription,
            contentfulEnvironment,
            contentfulSpaceId,
            fullName,
            email,
            pageUrl: pageUrl || window.location.href,
            pageId
          }
        }
      };

      const responseNew = await fetch(
        'https://lr-production.studio.theanswer.ai/api/v1/prediction/f767158b-775c-4e6b-92ea-fc78e9b0494a',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            question: message.payload.data.question
          })
        }
      );
      const results = await responseNew.json();

      logger.info('Bug report submitted successfully', { results });
      handleClose();
    } catch (err) {
      logger.error('Error submitting bug report', err);
      setError(err.message || 'Failed to submit bug report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!selectedElement} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Report a Bug</DialogTitle>
      <DialogContent>
        {selectedElement && (
          <div style={{ marginBottom: '16px', fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>
            Reporting bug for: {selectedElement.tagName.toLowerCase()}
            {elementInfo?.type && ` (Type: ${elementInfo.type})`}
            {elementInfo?.id && ` (ID: ${elementInfo.id})`}
          </div>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Bug Description"
          fullWidth
          multiline
          rows={4}
          value={bugDescription}
          onChange={e => setBugDescription(e.target.value)}
          error={!!error}
          helperText={error}
          disabled={isSubmitting}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmitBug}
          variant="contained"
          color="primary"
          disabled={isSubmitting || !bugDescription.trim()}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
