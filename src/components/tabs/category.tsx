import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import RemoveIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { ICategory } from '../../../schemas/category';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';


export const Category = () => {
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
        <div className='flex flex-row gap-5 flex-wrap'>
            {data.map(e => {
                return <Card elevation={5} className='min-w-[300px]' key={e._id}>
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