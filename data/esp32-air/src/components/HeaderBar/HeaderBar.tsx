"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Drawer } from "@mui/material";
import DrawerItem from "./DrawerItem";
import DashboardIcon from "@mui/icons-material/Dashboard";

export default function HeaderBar() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  // TODO : Add more Sidebar Drawer Menu Options
  const DrawerList = (
    <div className="flex flex-col w-[300px]" onClick={toggleDrawer(false)}>
      <DrawerItem route="/" text="Dashboard" Icon={DashboardIcon} />
    </div>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Smart Plant
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        PaperProps={{
          sx: {
            background: "#171717",
          },
        }}
        open={open}
        onClose={toggleDrawer(false)}
      >
        {DrawerList}
      </Drawer>
    </Box>
  );
}
