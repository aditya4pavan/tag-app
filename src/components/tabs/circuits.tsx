import React, { Fragment, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import SaveIcon from "@mui/icons-material/Save";
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

interface CircutItem {
    sub: string
    rest: number
}

export const Circuits = () => {

    const [isAdd, setIsAdd] = useState<boolean>(false);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [circuits, setCircuits] = useState<ICircuit[]>([]);
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [items, setItems] = useState<IWorkOut[]>([]);
    const [item, setItem] = useState<string>();
    const [rest, setRest] = useState<number>(0);

    const loadData = () => {
        axios.get('/api/circuit').then(resp => {
            setCircuits(resp.data.data);
        })
    }

    useEffect(() => {
        axios.get('/api/category').then(resp => {
            setCategories(resp.data.data);
        })
        loadData()
    }, [])

    const handleAdd = () => {
        if (item) {
            setItems(items.concat({ sub: item, rest } as IWorkOut));
            setRest(0);
            setItem(undefined);
        }
    }

    const isEnabled = () => { return name !== '' && description !== '' && category !== '' && items.length > 0 }

    const handleSave = () => {
        const circuit: ICircuit = {
            name,
            description,
            category: category,
            workouts: items
        } as ICircuit;
        axios.post('/api/circuit', { ...circuit }).then(() => {
            handleClear();
            loadData();
        });
    }

    const handleClear = () => {
        setIsAdd(false);
        setName('');
        setDescription('');
        setCategory('');
        setItems([]);
        setItem('');
        setRest(0);
    }

    const getName = (id: string, subcategory: string, isCategory?: boolean) => {
        const current = categories.find(e => e._id === id);
        if (isCategory)
            return current?.name
        if (current) {
            return current.tags.find(e => e._id === subcategory)?.tag;
        }
        return ''
    }

    return <div className="flex flex-col w-full h-full gap-2">
        <div className='flex-none'>
            <Button onClick={() => setIsAdd(true)} variant="outlined" className="capitalize block">Add New</Button>
        </div>
        <Dialog maxWidth='sm' onClose={() => setItem(undefined)} open={Boolean(item)}>
            <DialogContent>
                <div className="flex flex-col items-center gap-2">
                    <Typography variant="body1">{`Enter Rest Time (in secs.) if required after the workout ?`}</Typography>
                    <TextField fullWidth size="small" InputProps={{ type: 'number' }} placeholder='Rest Time(Secs)' value={rest} onChange={(e) => setRest(parseInt(e.target.value))} />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleAdd} size="small" variant="outlined">Save</Button>
            </DialogActions>
        </Dialog>
        <div className="flex flex-row flex-wrap gap-5">
            {isAdd && <Card className="ring-2 ring-blue-500 rounded-lg"
                sx={{ width: '100%', maxWidth: 360 }}>
                <CardContent>
                    <div className="flex flex-col gap-3">
                        <TextField size="small" label='Circuit Name' value={name} onChange={e => setName(e.target.value)} variant="outlined" />
                        <TextField size="small" label='Circuit Desc.' value={description} onChange={e => setDescription(e.target.value)} variant="outlined" />
                        <FormControl variant="outlined" size="small" fullWidth>
                            <InputLabel>Select Category</InputLabel>
                            <Select size="small" variant="filled" value={category} onChange={e => setCategory(e.target.value as string)}>
                                {categories.map(e =>
                                    <MenuItem key={e._id} value={e._id}>{e.name}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                        {category && <div className="flex flex-row gap-2 flex-wrap">
                            {categories.find(e => e._id === category)?.tags.map(x => {
                                return <Chip onClick={() => setItem(x._id)} key={x._id} variant="outlined" label={x.tag} />
                            })}
                            <small>Click on a tag to add workout to circuit</small>
                        </div>}
                        {items.length > 0 && <List subheader={<ListSubheader>Workouts</ListSubheader>}>
                            {items.map((e, idx) => {
                                return <Fragment key={idx}><ListItem className="border">
                                    <ListItemIcon>
                                        <SportsIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={getName(category, e.sub)} />
                                </ListItem>
                                    {e.rest > 0 && <ListItem className="border">
                                        <ListItemIcon>
                                            <RestIcon />
                                        </ListItemIcon>
                                        <ListItemText secondary={`${e.rest} sec`} primary={`Rest`} />
                                    </ListItem>}
                                </Fragment>
                            })}
                        </List>}
                    </div>
                </CardContent>
                <CardActions>
                    <IconButton onClick={handleSave} disabled={!isEnabled()}><SaveIcon /></IconButton>
                    <IconButton onClick={handleClear}><CloseIcon /></IconButton>
                </CardActions>
            </Card>
            }
        </div>
        <div className="flex flex-row flex-wrap gap-5">
            {circuits.map(e => {
                return <Card key={e._id} className="ring-2 ring-blue-500 rounded-lg" sx={{ width: '100%', maxWidth: 360 }}>
                    <CardHeader className="p-2" subheader={<div className="flex flex-col gap-2">
                        <Typography variant="h6">{e.name}</Typography>
                        <Typography variant="caption">{e.description}</Typography>
                        <div className="self-end">
                            <Chip label={getName(e.category, '', true)} />
                        </div>
                    </div>} />
                    <CardContent className="p-2">
                        <List subheader={<ListSubheader>Workouts</ListSubheader>}>
                            {e.workouts.map((x, idx) => {
                                return <Fragment key={idx}><ListItem className="border">
                                    <ListItemIcon>
                                        <SportsIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={getName(e.category, x.sub)} />
                                </ListItem>
                                    {x.rest > 0 && <ListItem className="border">
                                        <ListItemIcon>
                                            <RestIcon />
                                        </ListItemIcon>
                                        <ListItemText secondary={`${x.rest} sec`} primary={`Rest`} />
                                    </ListItem>}
                                </Fragment>
                            })}
                        </List>
                    </CardContent>
                </Card>
            })}
        </div>
    </div>
}