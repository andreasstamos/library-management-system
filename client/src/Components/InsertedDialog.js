import { Alert, Dialog, DialogContent, DialogContentText, DialogActions, Button, Typography } from "@mui/material";

function InsertedDialog({open, onClose, itemid}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogContent sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', rowGap: '1rem'}}>
        <DialogContentText>
          Το αντίτυπο καταχωρήθηκε με επιτυχία και έλαβε αριθμό αντιτύπου:
        </DialogContentText>
        <DialogContentText variant="h6">
          {itemid}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose}>OK</Button>
      </DialogActions>
    </Dialog>
  );
}

export default InsertedDialog;
