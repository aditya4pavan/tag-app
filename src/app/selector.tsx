'use client'
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import RemoveIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { ICategory } from '../../schemas/category';
import { IExercise } from '../../schemas/exercise';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import CheckIcon from '@mui/icons-material/Check'
import Badge from '@mui/material/Badge';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            className='bg-white'
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function BasicTabs() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Tags" {...a11yProps(0)} />
                    <Tab label="Exercises" {...a11yProps(1)} />
                    <Tab label="Categories" {...a11yProps(2)} />
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
        </Box>
    );
}


const Category = () => {
    const [open, setOpen] = React.useState<boolean>(false);
    const [name, setName] = React.useState<string>('');
    const [desc, setDesc] = React.useState<string>('');
    const [tag, setTag] = React.useState<string>('');
    const [tags, setTags] = React.useState<string[]>([]);
    const [data, setData] = React.useState<ICategory[]>([]);
    const [refresh, setRefresh] = React.useState<boolean>(false);

    React.useEffect(() => setRefresh(!refresh), [])

    React.useEffect(() => {
        setOpen(false);
        axios.get('/api/category').then(resp => {
            setData(resp.data.data)
        })
    }, [refresh])

    const handleSave = async () => {
        let data = { name, description: desc, tags }
        await axios.post('/api/category', data);
        setRefresh(!refresh);
    }

    const handleKeyDown = (evt: React.KeyboardEvent<any>) => {
        if (evt.key === 'Enter') {
            let newTags = new Set<string>(tags.concat(tag));
            setTags(Array.from(newTags));
            setTag('');
            evt.preventDefault();
        }
    }

    const handleRemove = (e: string) => {
        setTags(tags.filter(x => x !== e))
    }

    const handleDelete = async (e: string) => {
        await axios.delete(`/api/category?id=${e}`);
        setRefresh(!refresh);
    }

    const isDisabled = name === '' || tags.length < 1 || desc === ''

    return <div className='flex flex-col gap-2'>
        <Button sx={{ width: 100 }} onClick={() => setOpen(true)} className='capitalize' size='small' variant='outlined'>Add Category</Button>
        <Dialog fullWidth maxWidth={'sm'} onClose={() => setOpen(false)} open={open}>
            <div className='flex flex-col p-8 min-h-[300px] gap-5'>
                <TextField size='small' value={name} label="Name" variant="outlined" onChange={evt => setName(evt.target.value)} required />
                <TextField size='small' value={desc} label="Description" variant="outlined" onChange={evt => setDesc(evt.target.value)} />
                <TextField size='small' value={tag} onKeyDown={handleKeyDown} label="Tags" onChange={evt => setTag(evt.target.value)} variant="outlined" required />
                <div className='flex flex-row gap-2 w-full flex-wrap'>
                    {tags.map(e => {
                        return <Button onClick={() => handleRemove(e)} className='capitalize' variant='outlined' size='small' endIcon={<RemoveIcon />}>
                            {e}
                        </Button>
                    })}
                </div>
                <Button size='small' disabled={isDisabled} onClick={handleSave} className='w-24' variant='outlined'>Save</Button>
            </div>
        </Dialog>
        <div className='flex flex-row gap-5'>
            {data.map(e => {
                return <Card className='min-w-[300px]' key={e._id}>
                    <CardContent>
                        <div className='flex flex-row justify-between items-center'>
                            <Typography>{e.name}</Typography>
                            <IconButton onClick={() => handleDelete(e._id)}>
                                <RemoveIcon />
                            </IconButton>
                        </div>
                        {e.description}
                    </CardContent>
                    <CardActions>
                        {e.tags.map(x => {
                            return <Button key={x._id}>{x.tag}</Button>
                        })}
                    </CardActions>
                </Card>
            })}
        </div>
    </div>
}

const Exercise = () => {
    const [open, setOpen] = React.useState<boolean>(false);
    const [edit, setEdit] = React.useState<string | null>(null);
    const [name, setName] = React.useState<string>('');
    const [desc, setDesc] = React.useState<string>('');
    const [data, setData] = React.useState<IExercise[]>([]);
    const [refresh, setRefresh] = React.useState<boolean>(false);

    React.useEffect(() => setRefresh(!refresh), [])

    React.useEffect(() => {
        setOpen(false);
        axios.get('/api/exercise').then(resp => {
            setData(resp.data.data)
        })
        setName('');
        setDesc('');
        setEdit(null);
    }, [refresh])

    const handleSave = async () => {
        if (edit !== null) {
            handleEdit(edit);
            return;
        }
        let data = { name, description: desc }
        await axios.post('/api/exercise', data);
        setRefresh(!refresh);
    }

    const handleDelete = async (e: string) => {
        await axios.delete(`/api/exercise?id=${e}`);
        setRefresh(!refresh);
    }

    const handleEdit = async (id: string) => {
        let doc = data.find(e => e._id === id)
        if (doc) {
            doc.description = desc;
            await axios.put('/api/exercise', { ...doc })
            setRefresh(!refresh);
        }
    }

    const openEdit = (e: IExercise) => {
        setEdit(e._id);
        setName(e.name);
        setDesc(e.description);
    }

    const isDisabled = name === ''

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'description', headerName: 'Description', flex: 1 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            getActions: (e) => {
                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={() => openEdit(e.row)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<RemoveIcon />}
                        label="Delete"
                        onClick={() => handleDelete(e.row._id)}
                        color="inherit"
                    />,
                ];
            }
        }
    ]

    return <div className='flex flex-col gap-2'>
        <Button sx={{ width: 100 }} onClick={() => setOpen(true)} className='capitalize' size='small' variant='outlined'>Add Exercise</Button>
        <Dialog fullWidth maxWidth={'sm'} onClose={() => { setOpen(false); setEdit(null) }} open={open || edit !== null}>
            <div className='flex flex-col p-8 min-h-[300px] gap-5'>
                <TextField multiline size='small' value={name} label="Name" variant="outlined" onChange={evt => setName(evt.target.value)} required />
                <TextField size='small' value={desc} label="Description" variant="outlined" onChange={evt => setDesc(evt.target.value)} />
                <Button size='small' disabled={isDisabled} onClick={handleSave} className='w-24' variant='outlined'>Save</Button>
            </div>
        </Dialog>
        <Paper elevation={3}>
            <div className='p-3'>
                <DataGrid initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} pageSizeOptions={[5, 10, 20, 100]} rows={data.map(e => { return { ...e, id: e._id } })} columns={columns} />
            </div>
        </Paper>
    </div>
}

const Tag = () => {
    const [open, setOpen] = React.useState<IExercise | null>(null);
    const [exercises, setExercises] = React.useState<IExercise[]>([]);
    const [categories, setCategories] = React.useState<ICategory[]>([]);

    React.useEffect(() => {
        axios.get('/api/exercise').then(resp => {
            setExercises(resp.data.data);
        })
        axios.get('/api/category').then(resp => {
            setCategories(resp.data.data);
        })
    }, [])

    const handleTag = async (tagId: string, exercise: IExercise) => {
        let newTags = exercise.tags.includes(tagId) ? exercise.tags.filter(e => e !== tagId) : exercise.tags.concat(tagId);
        let data = { ...exercise, tags: newTags }
        let doc = await axios.put('/api/exercise', data)
        let newExercise = exercises.map(e => {
            if (e._id === doc.data._id)
                return doc.data
            else
                return e
        })
        // console.log(newExercise)       
        setExercises(newExercise);
        setOpen(data as IExercise);
    }

    return <div className='flex flex-row flex-wrap gap-5 items-center'>
        <Dialog fullWidth maxWidth={'sm'} onClose={() => setOpen(null)} open={open !== null}>
            <div className='flex flex-col p-8 min-h-[300px] gap-5'>
                {categories.map(e => {
                    return <div key={e._id}>
                        <Typography>{e.name}</Typography>
                        <Divider />
                        {open !== null && <div className='flex gap-2 py-2'>
                            {e.tags.map(x => {
                                return <Button color={open?.tags.includes(x._id) ? 'success' : 'primary'} key={x._id} onClick={() => handleTag(x._id, open)} startIcon={open?.tags.includes(x._id) ? <CheckIcon /> : null} className='capitalize' size='small' variant='outlined'>{x.tag}</Button>
                            })}
                        </div>}
                    </div>
                })}
            </div>
        </Dialog>
        {exercises.map(e => {
            return <Badge key={e._id} badgeContent={e.tags.length} color="primary">
                <Button onClick={() => setOpen(e)} className='w-[150px] capitalize' variant='outlined'>{e.name?.toLowerCase()}</Button>
            </Badge>
        })}
    </div>
}