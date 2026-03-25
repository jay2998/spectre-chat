import Room from '../models/Room.js'

export const createRoom = async (req, res) => {
  try {
    const room = new Room({
      name: req.body.name,
      description: req.body.description,
      createdBy: req.userId,
      members: [req.userId]
    })
    const saved = await room.save()
    res.status(201).json(saved)
  } catch (err) {
    if (err.code === 11000) return res.status(400).json('Room name already exists.')
    res.status(500).json('Something went wrong.')
  }
}

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 })
    res.status(200).json(rooms)
  } catch (err) {
    res.status(500).json('Something went wrong.')
  }
}

export const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
    if (!room) return res.status(404).json('Room not found.')
    res.status(200).json(room)
  } catch (err) {
    res.status(500).json('Something went wrong.')
  }
}

export const joinRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.userId } },
      { new: true }
    )
    res.status(200).json(room)
  } catch (err) {
    res.status(500).json('Something went wrong.')
  }
}