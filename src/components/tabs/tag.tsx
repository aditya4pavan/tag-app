"use client";
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import axios from "axios";
import { ICategory } from "../../../schemas/category";
import { IExercise } from "../../../schemas/exercise";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import CheckIcon from "@mui/icons-material/Check";
import Badge from "@mui/material/Badge";

export const Tag = () => {
  const [open, setOpen] = React.useState<IExercise | null>(null);
  const [exercises, setExercises] = React.useState<IExercise[]>([]);
  const [categories, setCategories] = React.useState<ICategory[]>([]);

  console.log(exercises, categories);

  React.useEffect(() => {
    axios.get("/api/exercise").then((resp) => {
      setExercises(resp.data.data);
    });
    axios.get("/api/category").then((resp) => {
      setCategories(resp.data.data);
    });
  }, []);

  const handleTag = async (tagId: string, exercise: IExercise) => {
    let newTags = exercise.tags.includes(tagId) ? exercise.tags.filter((e) => e !== tagId) : exercise.tags.concat(tagId);
    let data = { ...exercise, tags: [] as string[] };
    let doc = await axios.put("/api/exercise", data);
    let newExercise = exercises.map((e) => {
      if (e._id === doc.data._id) return doc.data;
      else return e;
    });
    // console.log(newExercise)
    setExercises(newExercise);
    setOpen(data as IExercise);
  };

  const clearTags = async () => {
    if (window.confirm("Are you sure you want to clear all tags?")) {
      const updatedExercise = exercises.map((e) => ({ ...e, tags: [] as string[] }));
      const result = await axios.patch("/api/exercise", updatedExercise);
      console.log(result);
    }
  };

  return (
    <div className="flex flex-row flex-wrap gap-5 items-center">
      <Dialog fullWidth maxWidth={"sm"} onClose={() => setOpen(null)} open={open !== null}>
        <div className="flex flex-col p-8 min-h-[300px] gap-5">
          {categories.map((e) => {
            return (
              <div key={e._id}>
                <Typography>{e.name}</Typography>
                <Divider />
                {open !== null && (
                  <div className="flex gap-2 py-2">
                    {e.tags.map((x) => {
                      return (
                        <Button color={open?.tags.includes(x._id) ? "success" : "primary"} key={x._id} onClick={() => handleTag(x._id, open)} startIcon={open?.tags.includes(x._id) ? <CheckIcon /> : null} className="capitalize" size="small" variant="outlined">
                          {x.tag}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Dialog>
      <Button className="capitalize" onClick={clearTags} color="error" variant="outlined">
        Clear All Tags
      </Button>
      <div className="w-full" />
      {exercises.map((e) => {
        return (
          <Badge key={e._id} badgeContent={e.tags.length} color="primary">
            <Button onClick={() => setOpen(e)} className="w-[150px] capitalize" variant="outlined">
              {e.name?.toLowerCase()}
            </Button>
          </Badge>
        );
      })}
    </div>
  );
};
