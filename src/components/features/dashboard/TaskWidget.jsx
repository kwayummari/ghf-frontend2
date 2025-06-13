import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
} from "@mui/material";
import { Assignment as TaskIcon } from "@mui/icons-material";

const TaskWidget = ({ tasks = [] }) => {
  const defaultTasks = [
    {
      id: 1,
      title: "Review employee performance evaluations",
      completed: false,
      priority: "high",
    },
    {
      id: 2,
      title: "Approve monthly attendance reports",
      completed: true,
      priority: "medium",
    },
    {
      id: 3,
      title: "Update employee handbook",
      completed: false,
      priority: "low",
    },
    {
      id: 4,
      title: "Schedule team meeting",
      completed: false,
      priority: "medium",
    },
  ];

  const [displayTasks, setDisplayTasks] = useState(
    tasks.length > 0 ? tasks : defaultTasks
  );

  const handleToggleTask = (taskId) => {
    setDisplayTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedTasks = displayTasks.filter((task) => task.completed).length;
  const totalTasks = displayTasks.length;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error.main";
      case "medium":
        return "warning.main";
      case "low":
        return "success.main";
      default:
        return "text.secondary";
    }
  };

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TaskIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              My Tasks
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {completedTasks}/{totalTasks} completed
          </Typography>
        </Box>

        <List dense>
          {displayTasks.slice(0, 4).map((task) => (
            <ListItem key={task.id} sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Checkbox
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                  size="small"
                  color="primary"
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: task.completed ? "line-through" : "none",
                      color: task.completed ? "text.secondary" : "text.primary",
                    }}
                  >
                    {task.title}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                    <Box
                      component="span"
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: getPriorityColor(task.priority),
                        display: "inline-block",
                        mr: 0.5,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {task.priority} priority
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {displayTasks.length === 0 && (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No tasks assigned
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskWidget;
