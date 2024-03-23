import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import RemoveIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import { IExercise } from '../../../schemas/exercise';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

export const Exercise = () => {
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