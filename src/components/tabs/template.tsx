import React, { Fragment, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SportsIcon from '@mui/icons-material/SportsGymnastics';
import RestIcon from '@mui/icons-material/BatterySaver';
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from '@mui/material/FormControl';
import InputLabel from "@mui/material/InputLabel";
import { ICategory } from "../../../schemas/category";
import axios from "axios";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { ICircuit, IWorkOut } from "../../../schemas/circuit";
import { ITemplate } from "../../../schemas/template";
import Badge from "@mui/material/Badge";

export const Template = () => {
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isAdd, setIsAdd] = useState<boolean>(false)
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [templates, setTemplates] = useState<ITemplate[]>([]);
    const [category, setCategory] = useState<string>('');
    const [items, setItems] = useState<string[]>([]);

    const loadData = () => {
        axios.get('/api/template').then(resp => {
            setTemplates(resp.data.data);
        })
    }

    useEffect(() => {
        axios.get('/api/category').then(resp => {
            setCategories(resp.data.data);
        })
        loadData()
    }, [])

    const handleAdd = () => {
        setItems(items.concat(category));
        setCategory('');
    }

    const handleClear = () => {
        setName('');
        setDescription('');
        setIsAdd(false);
        setItems([]);
    }

    const isEnabled = name !== '' && categories.length > 0

    const handleSave = () => {
        const template = {
            name, description, weeks: items.map((e, idx) => {
                return { category: e, order: idx + 1 }
            })
        }
        axios.post('/api/template', { ...template }).then(resp => {
            handleClear();
            loadData();
        })
    }

    const handleDelete = async (e: string) => {
        await axios.delete(`/api/template?id=${e}`);
        loadData()
    }

    const getName = (id: string) => {
        return categories.find(e => e._id === id)?.name || ''
    }

    return <div className="flex flex-col w-full h-full gap-2">
        <div className='flex-none'>
            <Button onClick={() => setIsAdd(true)} variant="outlined" className="capitalize block">Add New</Button>
            <Dialog maxWidth='sm' fullWidth open={isAdd} onClose={() => setIsAdd(false)}>
                <DialogContent>
                    <div className="flex flex-col gap-3">
                        <TextField required size="small" label='Name' value={name} onChange={e => setName(e.target.value)} variant="outlined" />
                        <TextField required size="small" label='Description' value={description} onChange={e => setDescription(e.target.value)} variant="outlined" />
                        <div className="flex flex-row">
                            <FormControl variant="outlined" size="small" fullWidth>
                                <InputLabel>Select Category</InputLabel>
                                <Select size="small" variant="filled" value={category} onChange={e => setCategory(e.target.value as string)}>
                                    {categories.map(e =>
                                        <MenuItem key={e._id} value={e._id}>{e.name}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            <IconButton onClick={handleAdd} disabled={category === ''}><AddIcon /></IconButton>
                        </div>
                        <Typography variant="caption">Add a Category to the Template</Typography>
                        <List>
                            {items.map((e, idx) => {
                                return <ListItem key={idx + 1} className="border">
                                    <ListItemText primary={getName(e)} secondary={`Week ${idx + 1}`} />
                                </ListItem>
                            })}
                        </List>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button disabled={!isEnabled} onClick={handleSave}>Save</Button>
                    <Button onClick={handleClear}>Cancel</Button>
                </DialogActions>
            </Dialog>
            <div className="flex flex-row gap-2">
                {templates.map(e => {
                    return <Card key={e._id} sx={{ maxWidth: 350 }}>
                        <CardHeader className="p-2" title={e.name} subheader={e.description} />
                        <CardContent>
                            <div className="flex flex-wrap">
                                {[...e.weeks].sort((a, b) => { return a.order - b.order }).map((x, idx) => {
                                    return <div key={idx} className="px-4 py-2">
                                        <Badge color="secondary" badgeContent={`Week ${x.order}`}>
                                            <Chip className="text-md" variant="outlined" label={getName(x.category)} />
                                        </Badge>
                                    </div>
                                })}
                            </div>
                        </CardContent>
                        <CardActions>
                            <Button size="small" variant="outlined" onClick={() => handleDelete(e._id)}>Remove</Button>
                        </CardActions>
                    </Card>
                })}
            </div>
        </div>
    </div>
}