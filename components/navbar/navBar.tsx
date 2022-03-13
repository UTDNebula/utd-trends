import { AppBar, makeStyles, Toolbar, Typography } from "@material-ui/core";
import { FlatLogoIcon as MySvgFile } from "./flatLogoIcon";
import React from "react";
import { Button, IconButton } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  toolBar: {
    display: 'spaced-between',
  },
  logo: {
    width: 75,
    height: 58,
  },

}));

const NavBar = () => {
  const classes = useStyles();
  return (
    <AppBar>
      <Toolbar className={classes.toolBar}>
         <Button href="/index.tsx" className={classes.logo}>
          <MySvgFile/>
        </Button>

        <Typography variant="h6" >
          Athena
        </Typography>

      </Toolbar>
    </AppBar>
  )
};
export default NavBar;