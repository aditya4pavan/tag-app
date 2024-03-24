import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import RemoveIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import { IExercise, IExerciseMeta, IExerciseMetaData } from '../../../schemas/exercise';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CardActions from '@mui/material/CardActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Check from '@mui/icons-material/Check';

export const Exercise = () => {
    const [open, setOpen] = React.useState<boolean>(false);
    const [edit, setEdit] = React.useState<string | null>(null);
    const [name, setName] = React.useState<string>('');
    const [desc, setDesc] = React.useState<string>('');
    const [diff, setDiff] = React.useState<string>('');
    const [metaInfo, setMetaInfo] = React.useState<string>('');
    const [data, setData] = React.useState<IExercise[]>([]);
    const [meta, setMeta] = React.useState<IExerciseMeta[]>([]);
    const [refresh, setRefresh] = React.useState<boolean>(false);

    const handleRefresh = () => {
        setRefresh(!refresh);
    }

    React.useEffect(() => {
        console.log(refresh)
        setOpen(false);
        axios.get('/api/exercise').then(resp => {
            setData(resp.data.data)
        })
        axios.get('/api/exercise/meta').then(resp => {
            setMeta(resp.data.data)
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
        axios.post('/api/exercise', data).then(handleRefresh);
    }

    const handleDifficulty = (val: string) => {
        setDiff(val);
    }

    const handleDelete = async (e: string) => {
        axios.delete(`/api/exercise?id=${e}`).then(handleRefresh);
    }

    const handleEdit = async (id: string) => {
        let doc = data.find(e => e._id === id)
        if (doc) {
            doc.description = desc;
            doc.meta = metaInfo;
            doc.difficulty = diff;
            axios.put('/api/exercise', { ...doc }).then(handleRefresh);
        }
    }

    const openEdit = (e: IExercise) => {
        setEdit(e._id);
        setName(e.name);
        setMetaInfo(e.meta);
        setDesc(e.description);
    }

    const isDisabled = name === ''

    const getMetaName = (id: string) => {
        const name = meta.find(e => e._id === id)?.name
        if (name)
            return <Chip variant='outlined' label={name} />
        return ''
    }

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'description', headerName: 'Description', flex: 1 },
        {
            field: 'meta', headerName: 'Meta', flex: 0.5, renderCell: (params) => {
                return getMetaName(params.row.meta)
            }
        },
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

    const difficulties = ['Beginner', 'Easy', 'Medium', 'Hard']

    return <div className='flex flex-col gap-2'>
        <Button sx={{ width: 100 }} onClick={() => setOpen(true)} className='capitalize' size='small' variant='outlined'>Add Exercise</Button>
        <Dialog fullWidth maxWidth={'sm'} onClose={() => { setOpen(false); setEdit(null) }} open={open || edit !== null}>
            <div className='flex flex-col p-8 min-h-[300px] gap-5'>
                <TextField multiline size='small' value={name} label="Name" variant="outlined" onChange={evt => setName(evt.target.value)} required />
                <TextField size='small' value={desc} label="Description" variant="outlined" onChange={evt => setDesc(evt.target.value)} />
                <div className='flex flex-row gap-2'>
                    {difficulties.map(e => {
                        return <Chip clickable onDelete={() => { }} deleteIcon={diff === e ? <Check /> : <></>} onClick={() => handleDifficulty(e)} key={e} variant='outlined' label={e} />
                    })}
                </div>
                <FormControl variant="outlined" size="small">
                    <InputLabel>Meta Type</InputLabel>
                    <Select size="small" variant="filled" value={metaInfo || ''} onChange={evt => setMetaInfo(evt.target.value as string)}>
                        {meta.map(e => {
                            return <MenuItem key={e._id} value={e._id}>{e.name}</MenuItem>
                        })}
                    </Select>
                </FormControl>
                <Button size='small' disabled={isDisabled} onClick={handleSave} className='w-24' variant='outlined'>Save</Button>
            </div>
        </Dialog>
        <Paper elevation={3}>
            <div className='p-3'>
                <DataGrid initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} pageSizeOptions={[5, 10, 20, 100]} rows={data.map(e => { return { ...e, id: e._id } })} columns={columns} />
            </div>
        </Paper>
        <ExerciseMeta />
    </div>
}

const ExerciseMeta = () => {
    const [name, setName] = React.useState<string>('');
    const [description, setDescription] = React.useState<string>('');
    const [open, setOpen] = React.useState<boolean>(false);
    const [data, setData] = React.useState<IExerciseMetaData[]>([]);
    const [meta, setMeta] = React.useState<IExerciseMeta[]>([]);

    const loadData = () => axios.get('/api/exercise/meta').then(resp => {
        setMeta(resp.data.data)
    });

    React.useEffect(() => {
        loadData()
    }, [])

    const handleRefresh = () => {
        loadData();
        setName('');
        setDescription('');
        setData([]);
        setOpen(false);
    }

    const handleAdd = () => {
        const result = {
            name, description, data
        }
        axios.post('/api/exercise/meta', { ...result }).then(handleRefresh);
    }

    const handleAddMeta = () => {
        setData(data.concat({ metaKey: '', metaValue: '' } as any as IExerciseMetaData))
    }

    const handleMetaData = (idx: number, value: string, type: 'metaKey' | 'metaValue') => {
        const newData = data.map((e, curr) => {
            if (idx === curr)
                return { ...e, [type]: value }
            return e
        })
        setData(newData as IExerciseMetaData[])
    }

    const isDisabled = () => {
        if (data.length < 1) return false;
        return data.some(e => e.metaKey === '' || e.metaValue === '')
    }

    const handleDelete = (id: string) => {
        axios.delete(`/api/exercise/meta?id=${id}`).then(handleRefresh);
    }

    return <>
        <Dialog fullWidth maxWidth='sm' open={open} onClose={() => setOpen(false)}>
            <DialogContent>
                <div className='flex flex-col gap-2'>
                    <TextField size="small" label='Name' value={name} onChange={e => setName(e.target.value)} variant="outlined" />
                    <TextField size="small" label='Description' value={description} onChange={e => setDescription(e.target.value)} variant="outlined" />
                    <div className='self-end'>
                        <Button variant='outlined' disabled={isDisabled()} onClick={handleAddMeta}>Add New</Button>
                    </div>
                    {data.map((e, idx) => {
                        return <div key={idx} className='flex flex-row gap-2'>
                            <TextField size="small" label='Meta Info' value={e.metaKey} onChange={e => handleMetaData(idx, e.target.value as string, 'metaKey')} variant="outlined" />
                            <TextField size="small" label='Meta Value.' value={e.metaValue} onChange={e => handleMetaData(idx, e.target.value as string, 'metaValue')} variant="outlined" />
                            <Button onClick={() => setData(data.filter((e, id) => id !== idx))}>Remove</Button>
                        </div>
                    })}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleAdd} disabled={isDisabled() || name === '' || description === '' || data.length < 1} variant='outlined'>Save</Button>
                <Button onClick={() => setOpen(false)} variant='outlined'>Cancel</Button>
            </DialogActions>
        </Dialog>
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                id="panel1-header"
            >
                <Typography>Meta Info</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <div className='flex flex-col gap-2'>
                    <Button className='capitalize self-end' size='small' onClick={() => setOpen(true)} variant='outlined'>Add New</Button>
                    {meta.map(e => {
                        return <Card key={e._id} sx={{ maxWidth: 300 }}>
                            <CardContent>
                                <div className='flex flex-col'>
                                    <Typography variant='body1'>{e.name}</Typography>
                                    <Typography variant='body2'>{e.description}</Typography>
                                    {e.data.map((x, idx) => {
                                        return <div key={idx} className='flex flex-row gap-2'>
                                            <Typography variant='caption'>{x.metaKey} |</Typography>
                                            <Typography variant='caption'>{x.metaValue}</Typography>
                                        </div>
                                    })}
                                </div>
                            </CardContent>
                            <CardActions><Button onClick={() => handleDelete(e._id)} size='small' variant='outlined'>Remove</Button></CardActions>
                        </Card>
                    })}
                </div>
            </AccordionDetails>
        </Accordion>
    </>
}