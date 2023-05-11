import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import './NotFound404.css';

function NotFound404() {
    return (
        <Box className="NotFoundContainer">
            <Typography variant="h1" component="h1" sx={{color: 'error.main'}}>
                OOPS!
            </Typography>
            <Typography variant="h4" component="h4" sx={{color: 'text.secondary'}}>
                Δυστυχώς η σελίδα δεν βρέθηκε. 
            </Typography>
            <Typography variant="h5" component="h5" sx={{color: 'text.secondary'}}>
                Ζητούμε συγγνώμη για την αναστάτωση.
            </Typography>
            <Typography variant="h6" component="h6">
                Παρακολούμε προσπαθήστε ξανά.
            </Typography>
        </Box>
    )
}

export default NotFound404;
