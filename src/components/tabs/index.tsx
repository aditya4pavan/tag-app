"use client";
import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Tag } from "@/components/tabs/tag";
import { Exercise } from "@/components/tabs/exercise";
import { Category } from "@/components/tabs/category";
import { Template } from "@/components/tabs/template";
import { Circuits } from "@/components/tabs/circuits";
import { signOut } from "next-auth/react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" className="bg-white" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Tags" {...a11yProps(0)} />
          <Tab label="Exercises" {...a11yProps(1)} />
          <Tab label="Categories" {...a11yProps(2)} />
          <Tab label="Templates" {...a11yProps(3)} />
          <Tab label="Circuits" {...a11yProps(4)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Tag />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Exercise />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <Category />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <Template />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={4}>
        <Circuits />
      </CustomTabPanel>
    </Box>
  );
}
