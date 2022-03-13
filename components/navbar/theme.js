import { createTheme } from "@material-ui/core";
import { blue, purple } from "@material-ui/core/colors";

export const theme = createTheme({
    palette:{
        primary:{
            main: "#7486CE" ,
        },
    },
    typography:{
        fontFamily:['Jost', 'sans-serif'].join(',')
    }
});